

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';

const App = () => {
  const API_URL = "https://final-projectmongo.vercel.app/api/employees";

  const [form, setForm] = useState({
    title: '',
    image: null,
    name: '',
    designation: '',
    dob: '',
    address: '',
  });

  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_URL);
      const updatedEmployees = response.data.map((employee) => {
        if (employee.image) {
          const base64Image = `data:${employee.contentType};base64,${Buffer.from(employee.image).toString('base64')}`;
          return { ...employee, image: base64Image };
        }
        return employee;
      });
      setEmployees(updatedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('name', form.name);
      formData.append('designation', form.designation);
      formData.append('dob', form.dob);
      formData.append('address', form.address);
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setEditingId(null);
      } else {
        await axios.post(API_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setForm({
        title: '',
        image: null,
        name: '',
        designation: '',
        dob: '',
        address: '',
      });
      fetchEmployees();
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: file, preview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit an employee
  const editEmployee = (employee) => {
    setForm({
      title: employee.title,
      name: employee.name,
      designation: employee.designation,
      dob: employee.dob,
      address: employee.address,
      image: null,
      preview: employee.image,
    });
    setEditingId(employee._id);
  };

  // Delete an employee
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setEmployees(employees.filter((employee) => employee._id !== id));
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-lg font-semibold">Employee Management System</h1>
          <ul className="flex space-x-4">
            <li><a href="#form" className="hover:text-blue-400">Add Employee</a></li>
            <li><a href="#employees" className="hover:text-blue-400">View Employees</a></li>
          </ul>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 shadow-lg">
        <h1 className="text-4xl font-bold text-center">Manage Your Employees Efficiently</h1>
      </header>

      {/* Body */}
      <main className="container mx-auto p-6" id="form">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-lg mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input input-bordered w-full"
              
              required
            />
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input input-bordered w-full"
              required
            />
            <input
              type="text"
              placeholder="Designation"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="input input-bordered w-full"
              required
            />
            <input
              type="date"
              placeholder="Date of Birth"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="input input-bordered w-full"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input input-bordered w-full"
              required
            />
            <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
          </div>
          {form.preview && (
            <img src={form.preview} alt="Preview" className="w-32 h-32 mt-4 rounded-lg object-cover" />
          )}
          <button type="submit" className="btn btn-primary mt-4">
            {editingId ? 'Update Employee' : 'Create Employee'}
          </button>
        </form>

        {/* Employee List */}
        <section id="employees">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee) => (
              <div key={employee._id} className="card bg-white shadow-md p-4 rounded-lg flex flex-col items-center">
                <div className="w-48 h-48 object-cover overflow-hidden">
                  <img src={employee.image} alt={employee.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg mt-2">{employee.title}</h3>
                <h3 className="font-bold text-lg mt-2">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.designation}</p>
                <p className="text-sm text-gray-600">{employee.dob}</p>
                <p className="text-sm text-gray-600">{employee.address}</p>
                <div className="flex justify-between w-full mt-4">
                  <button
                    onClick={() => editEmployee(employee)}
                    className="btn btn-secondary btn-sm w-1/2 mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEmployee(employee._id)}
                    className="btn btn-error btn-sm w-1/2 ml-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;







// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Buffer } from 'buffer';

// const App = () => {
//   const API_URL = "https://final-projectmongo.vercel.app/api/employees";

//   const [form, setForm] = useState({
//     title: '',
//     image: null,
//     name: '',
//     designation: '',
//     dob: '',
//     address: '',
//   });

//   const [employees, setEmployees] = useState([]);
//   const [editingId, setEditingId] = useState(null);

//   // Fetch employees
//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(API_URL);
//       const updatedEmployees = response.data.map((employee) => {
//         if (employee.image) {
//           const base64Image = `data:${employee.contentType};base64,${Buffer.from(employee.image).toString('base64')}`;
//           return { ...employee, image: base64Image };
//         }
//         return employee;
//       });
//       setEmployees(updatedEmployees);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append('title', form.title);
//       formData.append('name', form.name);
//       formData.append('designation', form.designation);
//       formData.append('dob', form.dob);
//       formData.append('address', form.address);
//       if (form.image) {
//         formData.append('image', form.image);
//       }

//       if (editingId) {
//         await axios.put(`${API_URL}/${editingId}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         setEditingId(null);
//       } else {
//         await axios.post(API_URL, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }

//       // Reset form and fetch employees
//       setForm({
//         title: '',
//         image: null,
//         name: '',
//         designation: '',
//         dob: '',
//         address: '',
//       });
//       fetchEmployees();
//     } catch (error) {
//       console.error("Error submitting form:", error.response?.data || error.message);
//     }
//   };

//   // Handle file input change
//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setForm({ ...form, image: file, preview: reader.result });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Edit an employee
//   const editEmployee = (employee) => {
//     setForm({
//       title: employee.title || '',
//       name: employee.name,
//       designation: employee.designation,
//       dob: employee.dob,
//       address: employee.address,
//       image: null,
//       preview: employee.image,
//     });
//     setEditingId(employee._id);
//   };

//   // Delete an employee
//   const deleteEmployee = async (id) => {
//     try {
//       await axios.delete(`${API_URL}/${id}`);
//       setEmployees(employees.filter((employee) => employee._id !== id));
//     } catch (error) {
//       console.error("Error deleting employee:", error);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-blue-600 text-white p-4 shadow">
//         <h1 className="text-2xl font-bold text-center">Employee Management</h1>
//       </header>

//       <main className="container mx-auto p-6">
//         {/* Form */}
//         <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg mb-6">
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             <input
//               type="text"
//               placeholder="Title"
//               value={form.title}
//               onChange={(e) => setForm({ ...form, title: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input
//               type="text"
//               placeholder="Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input
//               type="text"
//               placeholder="Designation"
//               value={form.designation}
//               onChange={(e) => setForm({ ...form, designation: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input
//               type="date"
//               placeholder="Date of Birth"
//               value={form.dob}
//               onChange={(e) => setForm({ ...form, dob: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input
//               type="text"
//               placeholder="Address"
//               value={form.address}
//               onChange={(e) => setForm({ ...form, address: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
//           </div>
//           {form.preview && (
//             <img src={form.preview} alt="Preview" className="w-32 h-32 mt-4 rounded-lg object-cover" />
//           )}
//           <button type="submit" className="btn btn-primary mt-4">
//             {editingId ? 'Update Employee' : 'Create Employee'}
//           </button>
//         </form>

//         {/* Employee List */}
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {employees.map((employee) => (
//             <div key={employee._id} className="card bg-white shadow-md p-4 rounded-lg flex flex-col items-center">
//               <div className="w-48 h-48 object-cover overflow-hidden">
//                 <img src={employee.image} alt={employee.name} className="w-full h-full object-cover" />
//               </div>
//               <h3 className="font-bold text-lg mt-2">{employee.title}</h3>
//               <h3 className="font-bold text-lg mt-2">{employee.name}</h3>
//               <p className="text-sm text-gray-600">{employee.designation}</p>
//               <p className="text-sm text-gray-600">{employee.dob}</p>
//               <p className="text-sm text-gray-600">{employee.address}</p>
//               <div className="flex justify-between w-full mt-4">
//                 <button
//                   onClick={() => editEmployee(employee)}
//                   className="btn btn-secondary btn-sm w-1/2 mr-1"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => deleteEmployee(employee._id)}
//                   className="btn btn-error btn-sm w-1/2 ml-1"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default App;







// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import dayjs from 'dayjs';
// import { Buffer } from 'buffer';

// const App = () => {
//   const API_URL = "https://final-projectmongo.vercel.app/api/employees";

//   const [form, setForm] = useState({
//     title: '',
//     image: null,
//     name: '',
//     designation: '',
//     dob: '',
//     address: '',
//   });
//   const [employees, setEmployees] = useState([]);
//   const [editingId, setEditingId] = useState(null);

//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(API_URL);
//       const updatedEmployees = response.data.map((employee) => {
//         if (employee.image) {
//           const base64Image = `data:${employee.contentType};base64,${Buffer.from(employee.image).toString('base64')}`;
//           return { ...employee, image: base64Image };
//         }
//         return employee;
//       });
//       setEmployees(updatedEmployees);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append('title', form.title);
//       formData.append('name', form.name);
//       formData.append('designation', form.designation);
//       formData.append('dob', form.dob);
//       formData.append('address', form.address);
//       if (form.image) {
//         formData.append('image', form.image);
//       }

//       if (editingId) {
//         await axios.put(`${API_URL}/${editingId}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         setEditingId(null);
//       } else {
//         await axios.post(API_URL, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }

//       setForm({
//         title: '',
//         image: null,
//         name: '',
//         designation: '',
//         dob: '',
//         address: '',
//       });
//       fetchEmployees();
//     } catch (error) {
//       console.error("Error submitting form:", error.response?.data || error.message);
//     }
//   };

//   const deleteEmployee = async (id) => {
//     try {
//       await axios.delete(`${API_URL}/${id}`);
//       setEmployees(employees.filter((p) => p._id !== id));
//     } catch (error) {
//       console.error("Error deleting employee:", error);
//     }
//   };

//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setForm({ ...form, image: file, preview: reader.result });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const editEmployee = (employee) => {
//     setForm({
//       title: employee.title,
//       name: employee.name,
//       designation: employee.designation,
//       dob: employee.dob,
//       address: employee.address,
//       image: null,
//       preview: employee.image,
//     });
//     setEditingId(employee._id);
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-blue-600 text-white p-4 shadow">
//         <h1 className="text-2xl font-bold text-center">Employee Management</h1>
//       </header>

//       <main className="container mx-auto p-6">
//         <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg mb-6">
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             <input
//               type="text"
//               placeholder="Title Name"
//               value={form.title}
//               onChange={(e) => setForm({ ...form, title: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input
//               type="text"
//               placeholder="Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input
//               type="text"
//               placeholder="Designation"
//               value={form.designation}
//               onChange={(e) => setForm({ ...form, designation: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input
//               type="date"
//               placeholder="Date of Birth"
//               value={form.dob}
//               onChange={(e) => setForm({ ...form, dob: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input
//               type="text"
//               placeholder="Address"
//               value={form.address}
//               onChange={(e) => setForm({ ...form, address: e.target.value })}
//               className="input input-bordered w-full"
//               required
//             />
//             <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
//           </div>
//           {form.preview && (
//             <img src={form.preview} alt="Preview" className="w-32 h-32 mt-4 rounded-lg object-cover" />
//           )}
//           <button type="submit" className="btn btn-primary mt-4">
//             {editingId ? 'Update Employee' : 'Create Employee'}
//           </button>
//         </form>

//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//   {employees.map((employee) => (
//     <div
//       key={employee._id}
//       className="card bg-white shadow-md p-4 rounded-lg flex flex-col items-center"
//     >
//       {/* Image with consistent size */}
//       <div className="w-48 h-48 object-cover overflow-hidden">
//         <img
//           src={employee.image}
//           alt={employee.name}
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* Employee Details */}
//       <h3 className="font-bold text-lg mt-2">{employee.title}</h3>
//       <h3 className="font-bold text-lg mt-2">{employee.name}</h3>
//       <p className="text-sm text-gray-600">{employee.designation}</p>
//       <p className="text-sm text-gray-600">{employee.dob}</p>
//       <p className="text-sm text-gray-600">{employee.address}</p>

//       {/* Buttons */}
//       <div className="flex justify-between w-full mt-4">
//         <button
//           onClick={() => editEmployee(employee)}
//           className="btn btn-secondary btn-sm w-1/2 mr-1"
//         >
//           Edit
//         </button>
//         <button
//           onClick={() => deleteEmployee(employee._id)}
//           className="btn btn-error btn-sm w-1/2 ml-1"
//         >
//           Delete
//         </button>
//       </div>
//     </div>
//   ))}
// </div>

//       </main>

     
//     </div>
//   );
// };

// export default App;




























// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import dayjs from 'dayjs';
// import { Buffer } from 'buffer';


// const App = () => {
//   const API_URL = "https://final-projectmongo.vercel.app/api/employees";

//   const [form, setForm] = useState({
//     title: '',
//     image: null,
//     name: '',
//     designation: '',
//     dob: '',  
//     address: '',
//   });
//   const [employees, setEmployees] = useState([]);
//   const [editingId, setEditingId] = useState(null);

//   // Fetch all products
//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(API_URL);
//       const updatedEmployees = response.data.map((employee) => {
//         if (employee.image) {
//           const base64Image = `data:${employee.contentType};base64,${Buffer.from(employee.image).toString('base64')}`;
//           return { ...employee, image: base64Image };
//         }
//         return employee;
//       });
//       setEmployees(updatedEmployees);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     }
//   };
  

//   // Create or Update a product
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append('title', form.title);
//       formData.append('name', form.name);
//       formData.append('designation', form.designation);
//       formData.append('dob', form.dob);
//       formData.append('address', form.address);
//       if (form.image) {
//         formData.append('image', form.image);
//       }

//       if (editingId) {
//         // Update product
//         await axios.put(`${API_URL}/${editingId}`, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//         setEditingId(null);
//       } else {
//         // Create product
//         await axios.post(API_URL, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//       }

//       // Reset form and fetch products after submission
//       setForm({ title: '',
//         image: null,
//         name: '',
//         designation: '',
//         dob: '',  
//         address: '', });
//         fetchEmployees();
//     } catch (error) {
//       console.error("Error submitting form:", error.response?.data || error.message);
//     }
//   };

//   // Delete a product
//   const deleteEmployee = async (id) => {
//     try {
//       await axios.delete(`${API_URL}/${id}`);
//       setEmployees(employees.filter((p) => p._id !== id));
//     } catch (error) {
//       console.error("Error deleting employee:", error);
//     }
//   };

//   // Handle file changes (for image preview)
//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       const reader = new FileReader();

//       reader.onloadend = () => {
//         setForm({ ...form, image: file, preview: reader.result });
//       };

//       reader.readAsDataURL(file); // Convert file to Base64 for preview
//     }
//   };

//   // Prefill form for editing
//   const editEmployee = (employee) => {
//     setForm({
//       title: employee.title,
//       name: employee.name,
//       designation: employee.designation,
//       dob: employee.dob,
//       address: employee.address,
//       image: null, // Reset image for editing
//       preview: employee.image, // Use existing image URL
//     });
//     setEditingId( employee._id);
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   return (
//     <div>
//       <h1>Employee Management</h1>

//       {/* Form */}
//       <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
//         <input
//           type="text"
//           placeholder="title Name"
//           value={form.title}
//           onChange={(e) => setForm({ ...form, title: e.target.value })}
//           required
//         />
//         <input
//           type="text"
//           placeholder="name"
//           value={form.name}
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//           required
//         />
//         <input
//           type="text"
//           placeholder="designation"
//           value={form.designation}
//           onChange={(e) => setForm({ ...form, designation: e.target.value })}
//           required
//         />
//          <input
//           type="text"
//           placeholder="dob"
//           value={form.dob}
//           onChange={(e) => setForm({ ...form, dob: e.target.value })}
//           required
//         />
//          <input
//           type="text"
//           placeholder="address"
//           value={form.address}
//           onChange={(e) => setForm({ ...form, address: e.target.value })}
//           required
//         />

//         <input type="file" onChange={handleFileChange} />
//         {form.preview && (
//           <img
//             src={form.preview}
//             alt="Preview"
//             style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }}
//           />
//         )}
//         <button type="submit">{editingId ? 'Update employee' : 'Create employee'}</button>
//       </form>

//       {/* Product Cards */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
//         {employees.map((employee) => (
//           console.log('image checking',employee),
//           <div
//             key={employee._id}
//             style={{
//               border: '1px solid #ccc',
//               padding: '16px',
//               borderRadius: '8px',
//               maxWidth: '200px',
//             }}
//           >
//             <img
//               src={employee.image}
//               alt={employee.name}
//               style={{ width: '100%', height: '100px', objectFit: 'cover' }}
//             />
//             <h3>{employee.name}</h3>
//             <p>{employee.designation}</p>
//             <p>{employee.dob}</p>
//             <p>{employee.address}</p>
//             <button onClick={() => editEmployee(employee)}>Edit</button>
//             <button onClick={() => deleteEmployee(employee._id)}>Delete</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default App;






