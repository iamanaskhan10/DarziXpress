import React, { useState } from 'react';
import { User, Ruler, Calendar, Phone, Shirt } from 'lucide-react';

const TailorMeasurement = () => {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "Ali Khan",
      phone: "+92 300 1234567",
      measurements: {
        shirt: { chest: 42, waist: 38, sleeve: 24 },
        pants: { waist: 36, inseam: 32 },
      },
      lastOrder: "Sherwani (Due: 2024-06-15)"
    }
  ]);

  const garmentTypes = {
    shirt: ['Chest', 'Waist', 'Sleeve', 'Neck'],
    pants: ['Waist', 'Inseam', 'Hip'],
    sherwani: ['Chest', 'Waist', 'Length'],
    blouse: ['Bust', 'Waist', 'Shoulder']
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Ruler className="mr-2" /> Client Measurements
      </h1>

      {/* Client List */}
      <div className="space-y-4">
        {clients.map(client => (
          <div key={client.id} className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <User className="mr-2 text-blue-500" />
              <h2 className="text-xl font-semibold">{client.name}</h2>
              <Phone className="ml-4 mr-2 text-sm" size={16} />
              <span className="text-gray-600">{client.phone}</span>
            </div>

            {/* Measurement Sections */}
            {Object.entries(client.measurements).map(([garment, values]) => (
              <div key={garment} className="ml-6 mb-4 p-3 bg-gray-50 rounded">
                <div className="flex items-center mb-2">
                  <Shirt className="mr-2" size={16} />
                  <h3 className="font-medium capitalize">{garment} Measurements</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(values).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium capitalize">{key}:</span> {value} inches
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center mt-3 text-sm">
              <Calendar className="mr-2" size={14} />
              <span className="text-gray-600">{client.lastOrder}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TailorMeasurement;
