const TopProductsTable = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">No products tracked yet</p>
    );
  }

  return (
    <div className="overflow-y-auto max-h-80">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              #
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Product
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
              Carbon
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
              <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                {product.product_name}
              </td>
              <td className="px-3 py-2 text-sm text-right">
                <span
                  className={`
                  font-medium
                  ${
                    product.carbon_kg > 20
                      ? "text-red-600"
                      : product.carbon_kg > 10
                        ? "text-orange-600"
                        : "text-green-600"
                  }
                `}
                >
                  {product.carbon_kg.toFixed(2)} kg
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopProductsTable;