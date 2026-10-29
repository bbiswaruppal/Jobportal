import { useState } from "react";

function SearchBar({ onSearch }) {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch() {
    onSearch({ jobTitle, location });
  }

  return (
    <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-xl bg-white p-4 shadow md:flex-row">
      <input
        type="text"
        placeholder="Job title or skill"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
      />

      <button
        onClick={handleSearch}
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;
