import AIIcon from "styles/icons/ai";

export default function AIButton({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="u1 h-11 w-full border-2 border-primary rounded-sm cursor-pointer p-2 group select-none active:scale-95 transition-transform"
    >
      <p className="font-bold font-(family-name:--secondary-font-family)">Create with</p>
      <AIIcon />
    </div>
  );
};