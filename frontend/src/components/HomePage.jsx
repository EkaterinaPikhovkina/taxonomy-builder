import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import HomePageHeader from './headers/HomePageHeader.jsx';
import HomePageButton from './buttons/HomePageButton.jsx';
import {clearRepository, createTaxonomyFromCorpusLLM, importTaxonomyFromFile} from "../services/api.js";
import ImportModal from "./modals/ImportModal.jsx";
import AddFilesModal from "./modals/AddFilesModal.jsx";


function HomePage({setTaxonomyData}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showImportForm, setShowImportForm] = useState(false);
    const [showAddFilesForm, setShowAddFilesForm] = useState(false);

    const handleCreateTaxonomy = async () => {
        setLoading(true);
        try {
            await clearRepository();
            console.log("Репозиторий очищен успешно");
            navigate('/editor');

        } catch (error) {
            console.error("Ошибка при очистке репозитория:", error);
            alert("Ошибка при очистке репозитория. Смотрите консоль.");
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (file, taxonomySetter) => {
        setLoading(true);
        try {
            await clearRepository();
            console.log("Репозиторій очищено перед імпортом");

            await importTaxonomyFromFile(file);
            console.log("Таксономія імпортована успішно");

            if (taxonomySetter) {
                taxonomySetter([]);
            }

            setShowImportForm(false);
            navigate('/editor');

        } catch (error) {
            console.error("Помилка при імпорті таксономії:", error);
            alert("Помилка при імпорті таксономії. Перевірте консоль.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTaxonomyFromCorpus = async (files) => {
        if (!files || files.length === 0) {
            alert("Будь ласка, оберіть файли для створення таксономії.");
            return;
        }
        setLoading(true);
        try {
            await clearRepository();
            console.log("Репозиторій очищено перед створенням таксономії з корпусу.");

            await createTaxonomyFromCorpusLLM(files);
            console.log("Таксономія з корпусу успішно створена та імпортована.");

            if (setTaxonomyData) {
                setTaxonomyData([]);
            }

            setShowAddFilesForm(false);
            navigate('/editor');

        } catch (error) {
            console.error("Помилка при створенні таксономії з корпусу:", error);
           alert(`Помилка при створенні таксономії з корпусу: ${error.message || "Перевірте консоль."}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col [background-image:linear-gradient(117deg,_#707E87_0%,_#939DA6_100%)]">
            <HomePageHeader title="Taxonomy builder"/>
            <div className="flex flex-col items-center justify-start pt-50 gap-6 flex-1">
                <HomePageButton
                    onClick={() => setShowImportForm(true)}
                >
                    Import taxonomy
                </HomePageButton>
                <HomePageButton
                    onClick={() => setShowAddFilesForm(true)}
                >
                    Upload document corpus
                </HomePageButton>
                <HomePageButton
                    onClick={handleCreateTaxonomy}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Create new taxonomy"}
                </HomePageButton>
            </div>

            <ImportModal
                show={showImportForm}
                onClose={() => setShowImportForm(false)}
                onImport={(file) => handleImport(file, setTaxonomyData)}
                setTaxonomyData={setTaxonomyData}
            />

            <AddFilesModal
                show={showAddFilesForm}
                onClose={() => setShowAddFilesForm(false)}
                onCreate={handleCreateTaxonomyFromCorpus}
            />

        </div>
    );
}

export default HomePage;