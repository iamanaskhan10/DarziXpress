import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => console.error("Failed to fetch order:", err));
  }, [id]);

  if (!order) return <div>Loading...</div>;

  // Dynamically determine status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-600";
      case "cancelled":
      case "canceled":
        return "text-red-600";
      case "in progress":
        return "text-yellow-500";
      case "pending":
        return "text-blue-500"; // Or any other color you prefer
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Order Details (ID: {id})</h1>
      <p><strong>Customer:</strong> {order.customerName}</p>
      <p><strong>Date:</strong> {order.date}</p>
      <p>
        <strong>Status:</strong>{" "}
        <span className={`font-semibold ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </p>

      <h2 className="text-lg font-semibold mt-6">Items</h2>
      <ul className="list-disc pl-6">
        {order.items.map((item, index) => (
          <li key={index}>
            {item.name} — Qty: {item.quantity}, Price: {item.price}
          </li>
        ))}
      </ul>

      <p className="mt-4"><strong>Total:</strong> ${order.total}</p>
    </div>
  );
}
