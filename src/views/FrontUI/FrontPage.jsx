import React, { useState } from "react";
import "./FrontPage.scss";

const FrontPage = () => {
  const [formData, setFormData] = useState({});

  return (
    <>
      <div className="query-form">
        <label htmlFor="input-query">Enter Query</label>
        <input
          id="input-query"
          type="text"
          placeholder="Enter your query"
          onChange={(e) => setFormData({ ...formData, query: e.target.value })}
          value={formData.query}
        />
        <button id="submit-query" onClick={() => console.log("$$", formData)}>
          Submit
        </button>
      </div>
    </>
  );
};
export default FrontPage;
