import React from "react";

const ForecastSubmenu = ({ isVisible }) => {
  if (!isVisible) return null;

  const submenuItems = [
    { id: "forecast", label: "Forecast" },
    { id: "goals", label: "Goals" },
  ];

  return (
    <div className="pl-10 space-y-1 mt-1">
      {submenuItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="block px-2 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
};

export default ForecastSubmenu;
