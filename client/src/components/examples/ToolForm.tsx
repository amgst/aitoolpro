import ToolForm from "../ToolForm";

export default function ToolFormExample() {
  return (
    <div className="max-w-4xl p-8">
      <ToolForm
        onSubmit={(data) => console.log('Form submitted:', data)}
      />
    </div>
  );
}
