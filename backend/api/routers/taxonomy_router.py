from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import JSONResponse, StreamingResponse
from core.config import settings
import tempfile
import os
import io
from typing import List
import logging
import traceback
from db import graphdb_ops
from llm.client import generate_taxonomy_with_llm
from api import schemas

router = APIRouter(
    tags=["Taxonomy Management"]
)

logger = logging.getLogger(__name__)


@router.get("/taxonomy-tree")
async def read_taxonomy_tree():
    try:
        bindings = graphdb_ops.get_taxonomy_hierarchy()
        print("Debug: read_taxonomy_tree - Получены bindings из get_taxonomy_hierarchy:")
        print(bindings)

        if not bindings:
            return []
        tree_data = graphdb_ops.build_hierarchy_tree(bindings)
        print("Debug: read_taxonomy_tree - Результат build_hierarchy_tree:")
        print(tree_data)

        return tree_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500,
                            detail=f"Ошибка при обработке запроса: {e}")


@router.post("/clear_repository")
async def clear_repository_endpoint():
    if graphdb_ops.clear_graphdb_repository(settings.graphdb_statements_endpoint):
        return {"message": "Репозиторій успішно очищено"}
    else:
        raise HTTPException(status_code=500, detail="Не вдалося очистити репозиторій")


@router.post("/import_taxonomy")
async def import_taxonomy_endpoint(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith((".ttl", ".rdf")):
            raise HTTPException(status_code=400, detail="Непідтримуваний формат файлу. Використовуйте .ttl або .rdf")

        with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp_file:
            contents = await file.read()
            tmp_file.write(contents)
            tmp_file_path = tmp_file.name

        graphdb_ops.import_taxonomy_to_graphdb(tmp_file_path, settings.graphdb_statements_endpoint)

        os.remove(tmp_file_path)

        return JSONResponse(content={"message": f"Таксономія з файлу '{file.filename}' успішно імпортована"})

    except HTTPException as e:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка при імпорті таксономії: {e}")


@router.post("/create_taxonomy_from_corpus_llm")
async def create_taxonomy_from_corpus_llm_endpoint(files: List[UploadFile] = File(...)):
    logger.info(f"Request to create taxonomy from corpus with {len(files)} file(s).")
    corpus_text_parts = []
    processed_filenames = []

    if not files:
        raise HTTPException(status_code=400, detail="Не надано жодного файлу.")

    for file in files:
        if not file.filename.endswith(".txt"):
            raise HTTPException(status_code=400,
                                detail=f"Непідтримуваний формат файлу: {file.filename}. Дозволено тільки .txt.")
        try:
            contents = await file.read()
            corpus_text_parts.append(contents.decode('utf-8'))
            processed_filenames.append(file.filename)
        except Exception as e:
            logger.error(f"Error reading file {file.filename}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Помилка читання файлу {file.filename}: {e}")

    combined_corpus_text = "\n\n--- НОВИЙ ФАЙЛ ---\n\n".join(corpus_text_parts)

    if not combined_corpus_text.strip():
        raise HTTPException(status_code=400, detail="Надані файли порожні або не містять тексту.")

    logger.info(
        f"Combined corpus text from {len(processed_filenames)} files ({', '.join(processed_filenames)}), length: {len(combined_corpus_text)} chars.")

    try:
        ttl_taxonomy_data_str = await generate_taxonomy_with_llm(combined_corpus_text)

        if not ttl_taxonomy_data_str or not ttl_taxonomy_data_str.strip().startswith("@prefix"):
            logger.error(f"LLM did not return valid TTL data. Response: {ttl_taxonomy_data_str[:500]}")
            raise HTTPException(status_code=500, detail="ЛЛМ не згенерувала валідну таксономію у форматі TTL.")

        ttl_taxonomy_bytes = ttl_taxonomy_data_str.encode('utf-8')

        graphdb_ops.import_taxonomy_to_graphdb(
            file_path=None,  # Not using file_path
            graphdb_endpoint_statements=settings.graphdb_statements_endpoint,
            file_content_bytes=ttl_taxonomy_bytes,
            content_type='application/x-turtle'  # LLM output is TTL
        )
        logger.info("Taxonomy from LLM imported successfully into GraphDB.")
        return JSONResponse(content={"message": "Таксономія успішно створена з корпусу документів та імпортована."})

    except ValueError as ve:  # Catch specific errors from LLM util
        logger.error(f"ValueError from LLM processing: {ve}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Помилка генерації таксономії ЛЛМ: {ve}")
    except HTTPException as e:  # Re-raise known HTTPExceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error during LLM taxonomy creation: {e}\n{traceback.format_exc()}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Неочікувана помилка при створенні таксономії з корпусу: {e}")


@router.get("/export_taxonomy")
async def export_taxonomy_endpoint(format: str = Query(..., regex="^(ttl|rdf)$")):
    try:
        content = graphdb_ops.export_taxonomy(format)

        if format == "ttl":
            content_type = "application/x-turtle"
            filename = "taxonomy.ttl"
        else:
            content_type = "application/rdf+xml"
            filename = "taxonomy.rdf"

        return StreamingResponse(io.BytesIO(content.encode()), media_type=content_type,
                                 headers={"Content-Disposition": f"attachment;filename={filename}"})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка при експорті таксономії: {e}")


@router.post("/add_topconcept")
async def add_topconcept_endpoint(request: schemas.AddTopConceptRequest):
    try:
        concept_name = request.concept_name
        concept_uri = f"http://example.org/taxonomy/{concept_name}"
        print(
            f"Debug: concept_uri={concept_uri}, concept_name={concept_name}")
        graphdb_ops.add_top_concept_to_graphdb(concept_uri, settings.graphdb_statements_endpoint)
        return {"message": f"Топ концепт '{concept_name}' успішно додано"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка при додаванні топ концепту: {e}")


@router.post("/add_subconcept")
async def add_subconcept_endpoint(request: schemas.AddSubConceptRequest):
    try:
        concept_name = request.concept_name
        parent_concept_uri = request.parent_concept_uri
        concept_uri = f"http://example.org/taxonomy/{concept_name}"
        print(f"Debug: concept_uri={concept_uri}, concept_name={concept_name}, parent_concept_uri={parent_concept_uri}")
        graphdb_ops.add_subconcept_to_graphdb(concept_uri, parent_concept_uri, settings.graphdb_statements_endpoint)
        return {"message": f"Концепт '{concept_name}' успішно додано"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка при додаванні концепту: {e}")


@router.post("/delete_concept")
async def delete_concept_endpoint(request: schemas.DeleteConceptRequest):
    try:
        concept_uri = request.concept_uri
        graphdb_ops.delete_concept_from_graphdb(concept_uri, settings.graphdb_statements_endpoint)
        return {"message": f"Концепт '{concept_uri}' успішно видалено"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка при видаленні концепту: {e}")


@router.post("/add_concept_label")
async def add_concept_label_endpoint(request: schemas.ConceptLiteralRequest):
    try:
        logger.debug(f"Adding label to {request.concept_uri}: '{request.literal.value}'@{request.literal.lang}")
        graphdb_ops.add_rdfs_label_to_graphdb(
            concept_uri=request.concept_uri,
            label_value=request.literal.value,
            label_lang=request.literal.lang,
            graphdb_endpoint=settings.graphdb_statements_endpoint
        )
        return {"message": f"Мітку '{request.literal.value}' успішно додано до концепту '{request.concept_uri}'"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding concept label: {e}\n{traceback.format_exc()}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Помилка при додаванні мітки концепту: {e}")


@router.post("/delete_concept_label")
async def delete_concept_label_endpoint(request: schemas.ConceptLiteralRequest):
    try:
        logger.debug(f"Deleting label from {request.concept_uri}: '{request.literal.value}'@{request.literal.lang}")
        graphdb_ops.delete_rdfs_label_from_graphdb(
            concept_uri=request.concept_uri,
            label_value=request.literal.value,
            label_lang=request.literal.lang,
            graphdb_endpoint=settings.graphdb_statements_endpoint
        )
        return {"message": f"Мітку '{request.literal.value}' успішно видалено з концепту '{request.concept_uri}'"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting concept label: {e}\n{traceback.format_exc()}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Помилка при видаленні мітки концепту: {e}")


@router.post("/update_concept_label")
async def update_concept_label_endpoint(request: schemas.ConceptLiteralUpdateRequest):
    try:
        logger.debug(
            f"Updating label for {request.concept_uri}: old='{request.old_literal.value}'@{request.old_literal.lang}, new='{request.new_literal.value}'@{request.new_literal.lang}")
        # Step 1: Delete the old label
        graphdb_ops.delete_rdfs_label_from_graphdb(
            concept_uri=request.concept_uri,
            label_value=request.old_literal.value,
            label_lang=request.old_literal.lang,
            graphdb_endpoint=settings.graphdb_statements_endpoint
        )
        # Step 2: Add the new label
        graphdb_ops.add_rdfs_label_to_graphdb(
            concept_uri=request.concept_uri,
            label_value=request.new_literal.value,
            label_lang=request.new_literal.lang,
            graphdb_endpoint=settings.graphdb_statements_endpoint
        )
        return {"message": f"Мітку для концепту '{request.concept_uri}' успішно оновлено"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating concept label: {e}\n{traceback.format_exc()}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Помилка при оновленні мітки концепту: {e}")


# Endpoints for Definitions (rdfs:comment)
@router.post("/add_concept_definition")
async def add_concept_definition_endpoint(request: schemas.ConceptLiteralRequest):
    try:
        logger.debug(f"Adding definition to {request.concept_uri}: '{request.literal.value}'@{request.literal.lang}")
        graphdb_ops.add_rdfs_comment_to_graphdb(
            concept_uri=request.concept_uri,
            comment_value=request.literal.value,
            comment_lang=request.literal.lang,
            graphdb_endpoint=settings.graphdb_statements_endpoint
        )
        return {"message": f"Визначення успішно додано до концепту '{request.concept_uri}'"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding concept definition: {e}\n{traceback.format_exc()}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Помилка при додаванні визначення концепту: {e}")


@router.post("/delete_concept_definition")
async def delete_concept_definition_endpoint(request: schemas.ConceptLiteralRequest):
    try:
        logger.debug(
            f"Deleting definition from {request.concept_uri}: '{request.literal.value}'@{request.literal.lang}")
        graphdb_ops.delete_rdfs_comment_from_graphdb(
            concept_uri=request.concept_uri,
            comment_value=request.literal.value,
            comment_lang=request.literal.lang,
            graphdb_endpoint=settings.graphdb_statements_endpoint
        )
        return {"message": f"Визначення успішно видалено з концепту '{request.concept_uri}'"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting concept definition: {e}\n{traceback.format_exc()}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Помилка при видаленні визначення концепту: {e}")


@router.post("/update_concept_definition")
async def update_concept_definition_endpoint(request: schemas.ConceptLiteralUpdateRequest):
    try:
        logger.debug(
            f"Updating definition for {request.concept_uri}: old='{request.old_literal.value}'@{request.old_literal.lang}, new='{request.new_literal.value}'@{request.new_literal.lang}")
        # Step 1: Delete the old definition
        graphdb_ops.delete_rdfs_comment_from_graphdb(
            concept_uri=request.concept_uri,
            comment_value=request.old_literal.value,
            comment_lang=request.old_literal.lang,
            graphdb_endpoint=settings.graphdb_statements_endpoint
        )
        # Step 2: Add the new definition
        graphdb_ops.add_rdfs_comment_to_graphdb(
            concept_uri=request.concept_uri,
            comment_value=request.new_literal.value,
            comment_lang=request.new_literal.lang,
            graphdb_endpoint=settings.graphdb_statements_endpoint
        )
        return {"message": f"Визначення для концепту '{request.concept_uri}' успішно оновлено"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating concept definition: {e}\n{traceback.format_exc()}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Помилка при оновленні визначення концепту: {e}")