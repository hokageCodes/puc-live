export default function ProductSection() {
  const products = [
    { name: "Tax Analyzer", status: "Live", description: "Automated tax compliance tool for enterprise auditing." },
    { name: "Legal Brief AI", status: "Beta", description: "Drafting assistant for contracts using generative AI." },
    { name: "Secure Exchange", status: "Live", description: "Encrypted document transfer portal for external clients." },
    { name: "Firm Directory", status: "Live", description: "Internal contact list and organizational chart." },
    { name: "Audit Flow 2.0", status: "Coming Soon", description: "Enhanced security protocols." },
    { name: "Knowledge Graph", status: "Coming Soon", description: "Cross-departmental data linking." },
  ];

  return (
    <section className="py-10 px-5">
      <h1 className="text-3xl font-bold mb-5">Available Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map((product, index) => (
          <div key={index} className="border p-5 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">Status: {product.status}</p>
            <p className="mt-2">{product.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}