export default function CodeBlock({ code }) {
  if (!code) return null;
  
  return (
    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto text-sm mb-6">
      <pre className="text-gray-100 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}
