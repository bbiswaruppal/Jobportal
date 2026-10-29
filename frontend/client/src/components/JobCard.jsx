import Button from "./Button.jsx";

function JobCard({ title, company, location, salary }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-lg">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>

      <p className="mt-2 text-gray-600">{company}</p>

      <p className="mt-3 text-sm text-gray-500">{location}</p>

      <p className="mt-4 font-semibold text-blue-600">{salary}</p>

      <div className="mt-4 flex gap-3">
        <Button onClick={() => {}}>View Job</Button>
        <Button onClick={() => alert("Please login to apply for this job!")}>
          Apply Now
        </Button>
      </div>
    </div>
  );
}

export default JobCard;
