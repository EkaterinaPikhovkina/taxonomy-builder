import {useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./components/HomePage.jsx";
import TaxonomyEditor from "./components/TaxonomyEditor.jsx";
import VisualisationPage from "./components/VisualisationPage.jsx";

function App() {
    const [taxonomyData, setTaxonomyData] = useState(null);


  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<HomePage setTaxonomyData={setTaxonomyData} />} />
              <Route path="/editor" element={<TaxonomyEditor taxonomyData={taxonomyData} setTaxonomyData={setTaxonomyData} />} />
              <Route path="/visualisation" element={<VisualisationPage taxonomyData={taxonomyData}/>} />
          </Routes>
      </BrowserRouter>
  )
}

export default App
