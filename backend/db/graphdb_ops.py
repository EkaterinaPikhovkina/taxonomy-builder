from typing import Optional
from fastapi import HTTPException
from SPARQLWrapper import SPARQLWrapper, JSON, TURTLE
import requests
import logging
from urllib.parse import urlparse
from core.config import settings
import sparql_queries

logger = logging.getLogger(__name__)


def parse_concat_results(concat_string):
    results = []
    if not concat_string or not concat_string.strip():
        return results
    pairs = concat_string.split('||')
    for pair in pairs:
        parts = pair.split('|', 1)
        if len(parts) == 2:
            value, lang = parts
            results.append({"value": value, "lang": lang if lang else None})
        elif len(parts) == 1:
            results.append({"value": parts[0], "lang": None})
    return results


def get_uri_display_name(uri_string: str) -> str:
    if not uri_string:
        return ""
    try:
        parsed_uri = urlparse(uri_string)
        if parsed_uri.fragment:
            return parsed_uri.fragment

        path = parsed_uri.path.strip('/')
        if path:
            return path.split('/')[-1]

        if parsed_uri.netloc and not path and not parsed_uri.fragment:
            pass

    except ValueError:
        pass

    parts = uri_string.split('/')
    last_part = parts[-1]
    if last_part:
        return last_part
    if len(parts) > 1 and parts[-2]:
        return parts[-2]
    return uri_string


def get_taxonomy_hierarchy():
    sparql = SPARQLWrapper(settings.graphdb_query_endpoint)
    sparql.setQuery(sparql_queries.get_taxonomy_hierarchy_query())
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        return results["results"]["bindings"]

    except Exception as e:
        print(f"Error querying GraphDB: {e}")
        print(f"Query used:\n{sparql_queries.get_taxonomy_hierarchy_query()}")
        raise HTTPException(status_code=500, detail=f"Error when querying GraphDB: {e}")


def build_hierarchy_tree(bindings):
    nodes = {}
    parent_child_links = {}
    all_uris = set()

    print("Debug: build_hierarchy_tree - Processing bindings...")

    for binding in bindings:
        class_uri = binding["class"]["value"]
        all_uris.add(class_uri)

        class_labels_info = binding.get("classLabelsInfo", {}).get("value")
        class_comments_info = binding.get("classCommentsInfo", {}).get("value")

        class_definitions = parse_concat_results(class_comments_info)
        all_class_labels = parse_concat_results(class_labels_info)
        class_title = get_uri_display_name(class_uri)

        if class_uri not in nodes:
            nodes[class_uri] = {
                "key": class_uri,
                "title": class_title,
                "children": [],
                "definitions": class_definitions,
                "labels": all_class_labels
            }
        else:
            nodes[class_uri]["title"] = class_title
            nodes[class_uri]["definitions"] = class_definitions
            nodes[class_uri]["labels"] = all_class_labels

        if "subClass" in binding and binding["subClass"]["value"]:
            subclass_uri = binding["subClass"]["value"]
            all_uris.add(subclass_uri)
            parent_child_links[subclass_uri] = class_uri

            subclass_labels_info = binding.get("subClassLabelsInfo", {}).get("value")
            subclass_comments_info = binding.get("subClassCommentsInfo", {}).get("value")

            subclass_definitions = parse_concat_results(subclass_comments_info)
            all_subclass_labels = parse_concat_results(subclass_labels_info)
            subclass_title = get_uri_display_name(subclass_uri)

            if subclass_uri not in nodes:
                nodes[subclass_uri] = {
                    "key": subclass_uri,
                    "title": subclass_title,
                    "children": [],
                    "definitions": subclass_definitions,
                    "labels": all_subclass_labels
                }
            else:
                nodes[subclass_uri]["title"] = subclass_title
                nodes[subclass_uri]["definitions"] = subclass_definitions
                nodes[subclass_uri]["labels"] = all_subclass_labels

    root_nodes = []
    processed_children = set()

    for child_uri, parent_uri in parent_child_links.items():
        if parent_uri in nodes and child_uri in nodes:
            if nodes[child_uri] not in nodes[parent_uri]["children"]:
                nodes[parent_uri]["children"].append(nodes[child_uri])
                processed_children.add(child_uri)
            else:
                print(f"Debug: Child {child_uri} already in parent {parent_uri}, skipping duplicate add.")
        else:
            print(f"Warning: Parent {parent_uri} or Child {child_uri} not found in nodes dict during linking.")

    for uri in all_uris:
        if uri not in parent_child_links:
            if uri in nodes:
                root_nodes.append(nodes[uri])
            else:
                print(f"Warning: Potential root node {uri} not found in nodes dictionary.")

    all_node_uris = set(nodes.keys())
    linked_uris = set(parent_child_links.keys()) | set(parent_child_links.values())
    identified_root_uris = {node['key'] for node in root_nodes}
    orphans = all_node_uris - linked_uris - identified_root_uris
    if orphans:
        print(f"Warning: Found potential orphan nodes (not linked, not root): {orphans}")

    print(f"Debug: build_hierarchy_tree - Identified {len(root_nodes)} root nodes.")
    return root_nodes


def clear_graphdb_repository(graphdb_endpoint):
    clear_query = sparql_queries.clear_repository_query()
    print("SPARQL Query being sent (in POST body):", clear_query)

    headers = {'Content-Type': 'application/sparql-update'}

    try:
        response = requests.post(graphdb_endpoint, data=clear_query,
                                 headers=headers)

        if response.status_code == 200 or response.status_code == 204:
            print("Репозиторий GraphDB успешно очищен (requests, POST body)")
            return True
        else:
            print(f"Ошибка при очистке GraphDB репозитория (requests, POST body). Статус код: {response.status_code}")
            print(f"Содержимое ответа: {response.content.decode('utf-8')}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"Ошибка соединения с GraphDB (requests, POST body): {e}")
        return False


def import_taxonomy_to_graphdb(file_path, graphdb_endpoint_statements, file_content_bytes=None, content_type=None):
    headers = {}
    data_to_send = None

    if file_content_bytes and content_type:
        data_to_send = file_content_bytes
        headers['Content-Type'] = content_type
    elif file_path:
        with open(file_path, 'rb') as f:
            data_to_send = f.read()
        if file_path.endswith('.ttl'):
            headers['Content-Type'] = 'text/turtle'
        else:
            raise ValueError("Unsupported file format for import (only .ttl)")
    else:
        raise ValueError("You must specify either the path to the file or the contents of the file to be imported.")

    params = {'context': f'<{settings.graphdb_default_graph}>'}

    try:
        response = requests.post(graphdb_endpoint_statements, data=data_to_send, headers=headers, params=params)
        response.raise_for_status()
        logger.info(f"Taxonomy imported successfully to GraphDB (status {response.status_code}).")
    except requests.exceptions.RequestException as e:
        error_detail = f"Import error in GraphDB: {e}. Status: {e.response.status_code if 'response' in locals() else 'N/A'}. Answer: {response.text if 'response' in locals() and e.response.text else 'N/A'}"
        logger.error(error_detail, exc_info=True)
        raise HTTPException(status_code=500, detail=error_detail)


def export_taxonomy(format_str):
    sparql = SPARQLWrapper(settings.graphdb_query_endpoint)
    sparql.setQuery(sparql_queries.export_taxonomy_query())

    if format_str == "ttl":
        sparql.setReturnFormat(TURTLE)
    else:
        raise ValueError("Unsupported export format")

    try:
        results = sparql.queryAndConvert()
        return results.decode()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error when exporting from GraphDB: {e}")


def add_top_concept_to_graphdb(concept_uri, graphdb_endpoint):
    sparql_query = sparql_queries.add_top_concept_query(concept_uri)
    print("SPARQL Query being sent for add top concept:", sparql_query)

    headers = {'Content-Type': 'application/sparql-update'}
    try:
        response = requests.post(graphdb_endpoint, data=sparql_query, headers=headers)
        if response.status_code != 200 and response.status_code != 204:
            raise Exception(
                f"Error adding a top concept to GraphDB. Status code: {response.status_code}, Answer: {response.text}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500, detail=f"GraphDB connection error when adding a top concept: {e}")


def add_subconcept_to_graphdb(concept_uri, parent_concept_uri, graphdb_endpoint):
    sparql_query = sparql_queries.add_subconcept_query(concept_uri, parent_concept_uri)
    print("SPARQL Query being sent for add concept:", sparql_query)

    headers = {'Content-Type': 'application/sparql-update'}
    try:
        response = requests.post(graphdb_endpoint, data=sparql_query, headers=headers)
        if response.status_code != 200 and response.status_code != 204:
            raise Exception(
                f"Error adding a concept to GraphDB. Status code: {response.status_code}, Answer: {response.text}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"GraphDB connection error when adding a concept: {e}")


def delete_concept_from_graphdb(concept_uri, graphdb_endpoint):
    sparql_query = sparql_queries.delete_concept_query(concept_uri)
    print("SPARQL Query being sent for delete concept:", sparql_query)

    headers = {'Content-Type': 'application/sparql-update'}
    try:
        response = requests.post(graphdb_endpoint, data=sparql_query, headers=headers)
        if response.status_code != 200 and response.status_code != 204:
            raise Exception(
                f"Error when deleting a concept from GraphDB. Status code: {response.status_code}, Відповідь: {response.text}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"GraphDB connection error when deleting a concept: {e}")


def _execute_sparql_update(query: str, graphdb_endpoint: str, operation_description: str):
    logger.debug(f"SPARQL Update Query for {operation_description}:\n{query}")
    headers = {'Content-Type': 'application/sparql-update'}
    try:
        response = requests.post(graphdb_endpoint, data=query, headers=headers)
        # GraphDB typically returns 204 No Content for successful updates
        if response.status_code == 200 or response.status_code == 204:
             logger.info(f"{operation_description} successful. Status: {response.status_code}")
             return True
        else:
            response.raise_for_status() # Raise HTTPError for other error codes
    except requests.exceptions.HTTPError as http_err:
        error_detail = (f"HTTP error during {operation_description}: {http_err}. "
                        f"Status: {http_err.response.status_code}. Response: {http_err.response.text}")
        logger.error(error_detail)
        raise HTTPException(status_code=http_err.response.status_code, detail=error_detail)
    except requests.exceptions.RequestException as e:
        error_detail = f"Connection error during {operation_description} with GraphDB: {e}"
        logger.error(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)
    return False


def add_rdfs_label_to_graphdb(concept_uri: str, label_value: str, label_lang: Optional[str], graphdb_endpoint: str):
    sparql_query = sparql_queries.add_rdfs_label_query(concept_uri, label_value, label_lang)
    _execute_sparql_update(sparql_query, graphdb_endpoint, f"adding rdfs:label '{label_value}@{label_lang if label_lang else ''}' to <{concept_uri}>")


def delete_rdfs_label_from_graphdb(concept_uri: str, label_value: str, label_lang: Optional[str], graphdb_endpoint: str):
    sparql_query = sparql_queries.delete_rdfs_label_query(concept_uri, label_value, label_lang)
    _execute_sparql_update(sparql_query, graphdb_endpoint, f"deleting rdfs:label '{label_value}@{label_lang if label_lang else ''}' from <{concept_uri}>")


def add_rdfs_comment_to_graphdb(concept_uri: str, comment_value: str, comment_lang: Optional[str], graphdb_endpoint: str):
    sparql_query = sparql_queries.add_rdfs_comment_query(concept_uri, comment_value, comment_lang)
    _execute_sparql_update(sparql_query, graphdb_endpoint, f"adding rdfs:comment to <{concept_uri}>")


def delete_rdfs_comment_from_graphdb(concept_uri: str, comment_value: str, comment_lang: Optional[str], graphdb_endpoint: str):
    sparql_query = sparql_queries.delete_rdfs_comment_query(concept_uri, comment_value, comment_lang)
    _execute_sparql_update(sparql_query, graphdb_endpoint, f"deleting rdfs:comment from <{concept_uri}>")