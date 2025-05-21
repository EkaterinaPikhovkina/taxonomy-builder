import axios from 'axios';
import { saveAs } from 'file-saver';

const API_BASE_URL = 'http://127.0.0.1:8000/';

export const fetchTaxonomyTree = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}taxonomy-tree`).then();

        return response.data;
    } catch (error) {
        console.error("Ошибка при запросе к API таксономии:", error);
        throw error;
    }
};

export const clearRepository = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}clear_repository`);
        return response.data;
    } catch (error) {
        console.error("Ошибка при очистке репозитория через API:", error);
        throw error;
    }
}

export const importTaxonomyFromFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${API_BASE_URL}import_taxonomy`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Помилка при імпорті таксономії з файлу (axios):", error);
        throw error;
    }
};

export const createTaxonomyFromCorpusLLM = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        // FastAPI expects multiple files under the same key 'files'
        formData.append('files', file, file.name);
    });

    try {
        const response = await axios.post(`${API_BASE_URL}create_taxonomy_from_corpus_llm`, formData, {
            headers: {
            },
        });
        return response.data;
    } catch (error) {
        console.error("Помилка при створенні таксономії з корпусу (axios):", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.detail || error.message || 'Невідома помилка сервера.';
        throw new Error(errorMessage);
    }
};

export const exportTaxonomy = async (format) => {
    try {
        const response = await axios.get(`${API_BASE_URL}export_taxonomy?format=${format}`, {
            responseType: 'blob',
        });

        const blob = response.data;
        const filename = format === 'ttl' ? 'taxonomy.ttl' : 'taxonomy.rdf';
        saveAs(blob, filename);

    } catch (error) {
        console.error("Помилка при експорті таксономії (axios):", error);
        throw error;
    }
};

export const addTopConcept = async (conceptName) => {
    try {
        const response = await axios.post(`${API_BASE_URL}add_topconcept`, {
            concept_name: conceptName
        });
        return response.data;
    } catch (error) {
        console.error("Помилка при додаванні топ концепту (axios):", error);
        throw error;
    }
};

export const addSubConcept = async (conceptName, parentConceptUri) => {
    try {
        const response = await axios.post(`${API_BASE_URL}add_subconcept`, {
            concept_name: conceptName,
            parent_concept_uri: parentConceptUri
        });
        return response.data;
    } catch (error) {
        console.error("Помилка при додаванні концепту (axios):", error);
        throw error;
    }
};

export const deleteConcept = async (conceptUri) => {
    try {
        const response = await axios.post(`${API_BASE_URL}delete_concept`, {
            concept_uri: conceptUri
        });
        return response.data;
    } catch (error) {
        console.error("Помилка при видаленні концепту (axios):", error);
        throw error;
    }
};

export const addConceptLabel = async (conceptUri, value, lang) => {
    try {
        const response = await axios.post(`${API_BASE_URL}add_concept_label`, {
            concept_uri: conceptUri,
            literal: { value, lang: lang || null } // Ensure lang is null if empty/undefined
        });
        return response.data;
    } catch (error) {
        console.error("Error adding concept label (axios):", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.detail || error.message || 'Не вдалося додати мітку.';
        throw new Error(errorMessage);
    }
};

export const deleteConceptLabel = async (conceptUri, value, lang) => {
    try {
        const response = await axios.post(`${API_BASE_URL}delete_concept_label`, {
            concept_uri: conceptUri,
            literal: { value, lang: lang || null }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting concept label (axios):", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.detail || error.message || 'Не вдалося видалити мітку.';
        throw new Error(errorMessage);
    }
};

export const updateConceptLabel = async (conceptUri, oldLiteral, newLiteral) => {
    try {
        const response = await axios.post(`${API_BASE_URL}update_concept_label`, {
            concept_uri: conceptUri,
            old_literal: { ...oldLiteral, lang: oldLiteral.lang || null },
            new_literal: { ...newLiteral, lang: newLiteral.lang || null }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating concept label (axios):", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.detail || error.message || 'Не вдалося оновити мітку.';
        throw new Error(errorMessage);
    }
};

export const addConceptDefinition = async (conceptUri, value, lang) => {
    try {
        const response = await axios.post(`${API_BASE_URL}add_concept_definition`, {
            concept_uri: conceptUri,
            literal: { value, lang: lang || null }
        });
        return response.data;
    } catch (error) {
        console.error("Error adding concept definition (axios):", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.detail || error.message || 'Не вдалося додати визначення.';
        throw new Error(errorMessage);
    }
};

export const deleteConceptDefinition = async (conceptUri, value, lang) => {
    try {
        const response = await axios.post(`${API_BASE_URL}delete_concept_definition`, {
            concept_uri: conceptUri,
            literal: { value, lang: lang || null }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting concept definition (axios):", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.detail || error.message || 'Не вдалося видалити визначення.';
        throw new Error(errorMessage);
    }
};

export const updateConceptDefinition = async (conceptUri, oldLiteral, newLiteral) => {
    try {
        const response = await axios.post(`${API_BASE_URL}update_concept_definition`, {
            concept_uri: conceptUri,
            old_literal: { ...oldLiteral, lang: oldLiteral.lang || null },
            new_literal: { ...newLiteral, lang: newLiteral.lang || null }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating concept definition (axios):", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.detail || error.message || 'Не вдалося оновити визначення.';
        throw new Error(errorMessage);
    }
};
