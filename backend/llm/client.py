import google.generativeai as genai
import logging
from core.config import settings


logger = logging.getLogger(__name__)

genai.configure(api_key=settings.gemini_api_key)


async def generate_taxonomy_with_llm(corpus_text: str) -> str:
    model = genai.GenerativeModel(settings.gemini_model_name)
    logger.info(f"Using Gemini model: {settings.gemini_model_name}")

    prompt = f"""
    You are an expert in ontologies and natural language processing. Your task is to analyze the provided corpus of texts in Ukrainian and create a hierarchical taxonomy from it.
    The taxonomy must be presented in Turtle (TTL) format.

    Taxonomy Requirements:
    1.  **Format:** Strictly Turtle (TTL).
    2.  **Prefixes:** Use the following prefixes:
        ```ttl
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @prefix ex: <http://example.org/taxonomy/document-corpus/> .
        ```
    3.  **Structure:**
        *   Each concept must be an instance of `rdfs:Class`.
        *   Use `rdfs:subClassOf` to define the hierarchy.
        *   Each concept must have an `rdfs:label` in Ukrainian (`@uk`) and English (`@en`). If an English equivalent is not obvious, provide an adequate translation or transliteration.
        *   Each concept must have an `rdfs:comment` in Ukrainian (`@uk`) and English (`@en`) briefly describing the concept.
    4.  **Hierarchy:** Create a logical hierarchy of concepts (2-4 levels deep) identified in the text. There should be both general (top-level) concepts and more specific subclasses.
    5.  **Quality:** Strive to identify key entities, notions, processes, roles, etc., described in the text. Avoid overly general or overly specific (singular) concepts if they do not form a hierarchy. (Note: Original had item 6, I renumbered to 5 as there was no item 5).
    6.  **TTL Only:** Your response must contain ONLY TTL data, without any explanations, Markdown comments, or other text before or after the TTL block. Start your response directly with `@prefix`.
    
    Example structure for one concept:
    ```ttl
    ex:SomeConceptName
        a rdfs:Class ;
        rdfs:subClassOf ex:SomeParentConcept ; # (if it's not a top-level concept)
        rdfs:label "Назва концепту"@uk ;
        rdfs:label "Concept Name"@en ;
        rdfs:comment "Короткий опис концепту українською."@uk ;
        rdfs:comment "Short description of the concept in English."@en .
        
    Provided corpus of texts:
    --- START OF CORPUS ---
    {corpus_text}
    --- END OF CORPUS ---
    
    Your response (TTL only):
    """

    logger.info(f"Sending prompt to Gemini. Corpus length: {len(corpus_text)} chars.")

    try:
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=settings.gemini_max_output_tokens
        )

        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]

        response = await model.generate_content_async(
            prompt,
            generation_config=generation_config,
            safety_settings=safety_settings
        )

        if response.parts:
            full_response_text = response.text.strip()
            logger.debug(f"Raw LLM response (full): \n{full_response_text}")
            ttl_data = full_response_text

            if len(response.text) >= settings.gemini_max_output_tokens:
                logger.warning(f"LLM response might have been truncated by max_output_tokens ({settings.gemini_max_output_tokens}).")

            if not ttl_data.startswith("@prefix"):
                logger.warning("LLM response did not start with @prefix. Attempting to clean.")

                ttl_start_index = ttl_data.find("@prefix")
                if ttl_start_index == -1:
                    logger.error(
                        f"LLM response did not contain @prefix. Cannot extract TTL. Response starts with: {ttl_data[:500]}")
                    raise ValueError("The LLM returned a response in an unexpected format (missing @prefix).")

                ttl_data = ttl_data[ttl_start_index:]

                ttl_end_index_markdown = ttl_data.find("\n```")
                if ttl_end_index_markdown != -1:
                    logger.warning(
                        f"Found potential markdown end at index {ttl_end_index_markdown}. Truncating response.")
                    ttl_data = ttl_data[:ttl_end_index_markdown]

                if not ttl_data.strip():
                    logger.error("Extracted TTL data is empty after cleaning.")
                    raise ValueError("Failed to extract valid TTL data from the LLM response.")

            logger.info(f"LLM generated taxonomy: {ttl_data}")
            return ttl_data
        else:
            logger.error(f"LLM response was empty or blocked. Feedback: {response.prompt_feedback}")
            block_reason = response.prompt_feedback.block_reason if response.prompt_feedback else "Unknown"
            block_message = f"LLM did not return the content or the request was blocked. Reason: {block_reason}"
            if response.prompt_feedback and response.prompt_feedback.safety_ratings:
                block_message += f" Safety Ratings: {response.prompt_feedback.safety_ratings}"
            raise ValueError(block_message)

    except Exception as e:
        logger.exception(f"Error calling Gemini API: {e}")
        raise
