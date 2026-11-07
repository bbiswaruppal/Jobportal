import { useState } from "react";

function SearchBar({ onSearch }) {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(e) {
    e.preventDefault();

    onSearch({
      jobTitle: jobTitle.trim(),
      location: location.trim(),
    });
  }

  function handleReset() {
    setJobTitle("");
    setLocation("");
    onSearch({
      jobTitle: "",
      location: "",
    });
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-xl bg-white p-4 shadow md:flex-row"
    >
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
        type="submit"
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Search
      </button>

      <button
        type="button"
        onClick={handleReset}
        className="rounded-lg border px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
      >
        Reset
      </button>
    </form>
  );
}

export default SearchBar;