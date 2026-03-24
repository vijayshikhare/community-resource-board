// import React, { useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { apiHelpers } from '../services/api';

// const Search = () => {
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();
  
//   const [resources, setResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [pagination, setPagination] = useState({
//     total: 0,
//     page: 1,
//     pages: 1,
//     limit: 9
//   });

//   // Filter states
//   const [filters, setFilters] = useState({
//     search: searchParams.get('search') || '',
//     type: searchParams.get('type') || '',
//     category: searchParams.get('category') || '',
//     location: searchParams.get('location') || '',
//     sort: searchParams.get('sort') || '-createdAt'
//   });

//   const resourceTypes = ['Training', 'Workshop', 'Internship', 'Job', 'Scholarship', 'Event', 'Course', 'Other'];
//   const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Education', 'Other'];
//   const locationTypes = ['Remote', 'On-site', 'Hybrid'];

//   useEffect(() => {
//     fetchResources();
//   }, [pagination.page, filters.type, filters.category, filters.location, filters.sort]);

//   const fetchResources = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       const params = {
//         page: pagination.page,
//         limit: pagination.limit,
//         ...(filters.search && { search: filters.search }),
//         ...(filters.type && { type: filters.type }),
//         ...(filters.category && { category: filters.category }),
//         ...(filters.location && { 'location.type': filters.location }),
//         sort: filters.sort
//       };

//       const data = await apiHelpers.getAllResources(params);
//       setResources(data.resources || []);
//       setPagination(prev => ({
//         ...prev,
//         total: data.pagination?.total || 0,
//         pages: data.pagination?.pages || 1
//       }));

//     } catch (err) {
//       console.error('Fetch resources error:', err);
//       setError(apiHelpers.getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     setPagination(prev => ({ ...prev, page: 1 }));
//     fetchResources();
//   };

//   const handleFilterChange = (filterName, value) => {
//     setFilters(prev => ({ ...prev, [filterName]: value }));
//     setPagination(prev => ({ ...prev, page: 1 }));
    
//     // Update URL params
//     const newParams = new URLSearchParams(searchParams);
//     if (value) {
//       newParams.set(filterName, value);
//     } else {
//       newParams.delete(filterName);
//     }
//     setSearchParams(newParams);
//   };

//   const clearFilters = () => {
//     setFilters({
//       search: '',
//       type: '',
//       category: '',
//       location: '',
//       sort: '-createdAt'
//     });
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setSearchParams({});
//   };

//   const hasActiveFilters = filters.search || filters.type || filters.category || filters.location;

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };

//   return (
//     <main>
//       <div className="container" style={{ padding: '2rem 1rem' }}>
//         {/* Header */}
//         <section style={{ marginBottom: '2rem', textAlign: 'center' }}>
//           <h1 style={{ 
//             fontSize: 'clamp(2rem, 5vw, 3rem)',
//             marginBottom: '0.5rem',
//             color: 'var(--text)'
//           }}>
//             Browse Resources
//           </h1>
//           <p style={{ 
//             color: 'var(--text-light)',
//             fontSize: '1.125rem',
//             maxWidth: '600px',
//             margin: '0 auto'
//           }}>
//             Explore training programs, internships, workshops, and more
//           </p>
//         </section>

//         {/* Search Bar */}
//         <section style={{ marginBottom: '2rem' }}>
//           <form onSubmit={handleSearch} style={{
//             display: 'flex',
//             gap: '0.5rem',
//             maxWidth: '800px',
//             margin: '0 auto'
//           }}>
//             <div style={{ flex: 1, position: 'relative' }}>
//               <input
//                 type="text"
//                 placeholder="Search resources by title, description, or tags..."
//                 value={filters.search}
//                 onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                 style={{
//                   width: '100%',
//                   padding: '1rem 1rem 1rem 3rem',
//                   fontSize: '1rem',
//                   border: '2px solid var(--border)',
//                   borderRadius: 'var(--radius-sm)',
//                   outline: 'none'
//                 }}
//               />
//               <span style={{
//                 position: 'absolute',
//                 left: '1rem',
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 fontSize: '1.25rem',
//                 color: 'var(--muted)'
//               }}>
//                 🔍
//               </span>
//             </div>
//             <button 
//               type="submit" 
//               className="btn btn-primary"
//               style={{ padding: '1rem 2rem', whiteSpace: 'nowrap' }}
//             >
//               Search
//             </button>
//           </form>
//         </section>

//         {/* Filters */}
//         <section style={{ marginBottom: '2rem' }}>
//           <div className="card" style={{ padding: '1.5rem' }}>
//             <div style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: '1rem',
//               flexWrap: 'wrap',
//               gap: '1rem'
//             }}>
//               <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Filters</h3>
//               {hasActiveFilters && (
//                 <button
//                   onClick={clearFilters}
//                   style={{
//                     background: 'none',
//                     border: 'none',
//                     color: 'var(--primary)',
//                     cursor: 'pointer',
//                     fontSize: '0.875rem',
//                     textDecoration: 'underline'
//                   }}
//                 >
//                   Clear All
//                 </button>
//               )}
//             </div>

//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//               gap: '1rem'
//             }}>
//               {/* Type Filter */}
//               <div>
//                 <label style={{ 
//                   display: 'block',
//                   fontSize: '0.875rem',
//                   fontWeight: '600',
//                   marginBottom: '0.5rem',
//                   color: 'var(--text)'
//                 }}>
//                   Type
//                 </label>
//                 <select
//                   value={filters.type}
//                   onChange={(e) => handleFilterChange('type', e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '0.5rem',
//                     border: '1px solid var(--border)',
//                     borderRadius: 'var(--radius-sm)',
//                     fontSize: '0.875rem',
//                     background: '#2e3346ff',
//                     cursor: 'pointer'
//                   }}
//                 >
//                   <option value="">All Types</option>
//                   {resourceTypes.map(type => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Category Filter */}
//               <div>
//                 <label style={{ 
//                   display: 'block',
//                   fontSize: '0.875rem',
//                   fontWeight: '600',
//                   marginBottom: '0.5rem',
//                   color: 'var(--text)'
//                 }}>
//                   Category
//                 </label>
//                 <select
//                   value={filters.category}
//                   onChange={(e) => handleFilterChange('category', e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '0.5rem',
//                     border: '1px solid var(--border)',
//                     borderRadius: 'var(--radius-sm)',
//                     fontSize: '0.875rem',
//                     background: '#2e3346ff',
//                     cursor: 'pointer'
//                   }}
//                 >
//                   <option value="">All Categories</option>
//                   {categories.map(cat => (
//                     <option key={cat} value={cat}>{cat}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Location Filter */}
//               <div>
//                 <label style={{ 
//                   display: 'block',
//                   fontSize: '0.875rem',
//                   fontWeight: '600',
//                   marginBottom: '0.5rem',
//                   color: 'var(--text)'
//                 }}>
//                   Location
//                 </label>
//                 <select
//                   value={filters.location}
//                   onChange={(e) => handleFilterChange('location', e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '0.5rem',
//                     border: '1px solid var(--border)',
//                     borderRadius: 'var(--radius-sm)',
//                     fontSize: '0.875rem',
//                     background: '#2e3346ff',
//                     cursor: 'pointer'
//                   }}
//                 >
//                   <option value="">All Locations</option>
//                   {locationTypes.map(loc => (
//                     <option key={loc} value={loc}>{loc}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Sort */}
//               <div>
//                 <label style={{ 
//                   display: 'block',
//                   fontSize: '0.875rem',
//                   fontWeight: '600',
//                   marginBottom: '0.5rem',
//                   color: 'var(--text)'
//                 }}>
//                   Sort By
//                 </label>
//                 <select
//                   value={filters.sort}
//                   onChange={(e) => handleFilterChange('sort', e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '0.5rem',
//                     border: '1px solid var(--border)',
//                     borderRadius: 'var(--radius-sm)',
//                     fontSize: '0.875rem',
//                     background: '#2e3346ff',
//                     cursor: 'pointer'
//                   }}
//                 >
//                   <option value="-createdAt">Newest First</option>
//                   <option value="createdAt">Oldest First</option>
//                   <option value="title">Title (A-Z)</option>
//                   <option value="-title">Title (Z-A)</option>
//                   <option value="-views">Most Viewed</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Results Count */}
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '1.5rem',
//           flexWrap: 'wrap',
//           gap: '1rem'
//         }}>
//           <p style={{ color: 'var(--text-light)', margin: 0 }}>
//             {loading ? 'Loading...' : `Found ${pagination.total} resource${pagination.total !== 1 ? 's' : ''}`}
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div style={{
//             background: '#fee2e2',
//             border: '1px solid #fecaca',
//             color: '#991b1b',
//             padding: '1rem',
//             borderRadius: 'var(--radius-sm)',
//             marginBottom: '2rem'
//           }}>
//             ⚠️ {error}
//           </div>
//         )}

//         {/* Loading State */}
//         {loading && (
//           <div style={{ textAlign: 'center', padding: '3rem' }}>
//             <div style={{
//               width: '50px',
//               height: '50px',
//               border: '4px solid #f3f4f6',
//               borderTopColor: '#10b981',
//               borderRadius: '50%',
//               margin: '0 auto',
//               animation: 'spin 1s linear infinite'
//             }}></div>
//           </div>
//         )}

//         {/* Resources Grid */}
//         {!loading && resources.length === 0 ? (
//           <div className="card" style={{
//             textAlign: 'center',
//             padding: '4rem 2rem',
//             background: 'var(--bg-secondary)'
//           }}>
//             <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
//             <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>
//               No Resources Found
//             </h3>
//             <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
//               {hasActiveFilters 
//                 ? 'Try adjusting your filters or search criteria'
//                 : 'No resources available at the moment'}
//             </p>
//             {hasActiveFilters && (
//               <button onClick={clearFilters} className="btn btn-primary">
//                 Clear Filters
//               </button>
//             )}
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
//               {resources.map((resource) => (
//                 <div
//                   key={resource._id}
//                   className="card"
//                   style={{
//                     cursor: 'pointer',
//                     transition: 'transform 0.2s, box-shadow 0.2s',
//                     height: '100%',
//                     display: 'flex',
//                     flexDirection: 'column'
//                   }}
//                   onClick={() => navigate(`/resources/${resource._id}`)}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = 'translateY(-4px)';
//                     e.currentTarget.style.boxShadow = 'var(--card-shadow-lg)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = 'translateY(0)';
//                     e.currentTarget.style.boxShadow = 'var(--card-shadow)';
//                   }}
//                 >
//                   {/* Image */}
//                   {resource.imageUrl ? (
//                     <img
//                       src={resource.imageUrl}
//                       alt={resource.title}
//                       style={{
//                         width: '100%',
//                         height: '180px',
//                         objectFit: 'cover',
//                         borderRadius: 'var(--radius-sm)',
//                         marginBottom: '1rem'
//                       }}
//                     />
//                   ) : (
//                     <div style={{
//                       width: '100%',
//                       height: '180px',
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       borderRadius: 'var(--radius-sm)',
//                       marginBottom: '1rem',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontSize: '3rem'
//                     }}>
//                       📚
//                     </div>
//                   )}

//                   {/* Tags */}
//                   <div style={{
//                     display: 'flex',
//                     gap: '0.5rem',
//                     marginBottom: '0.75rem',
//                     flexWrap: 'wrap'
//                   }}>
//                     <span style={{
//                       padding: '0.25rem 0.75rem',
//                       background: 'var(--primary)',
//                       color: 'white',
//                       borderRadius: 'var(--radius-sm)',
//                       fontSize: '0.75rem',
//                       fontWeight: '600'
//                     }}>
//                       {resource.type}
//                     </span>
//                     {resource.featured && (
//                       <span style={{
//                         padding: '0.25rem 0.75rem',
//                         background: '#fbbf24',
//                         color: 'white',
//                         borderRadius: 'var(--radius-sm)',
//                         fontSize: '0.75rem',
//                         fontWeight: '600'
//                       }}>
//                         ⭐ Featured
//                       </span>
//                     )}
//                   </div>

//                   {/* Title */}
//                   <h3 style={{
//                     fontSize: '1.125rem',
//                     marginBottom: '0.5rem',
//                     color: 'var(--text)',
//                     lineHeight: '1.4'
//                   }}>
//                     {resource.title}
//                   </h3>

//                   {/* Description */}
//                   <p style={{
//                     fontSize: '0.875rem',
//                     color: 'var(--text-light)',
//                     marginBottom: '1rem',
//                     flex: 1,
//                     lineHeight: '1.6'
//                   }}>
//                     {resource.description?.substring(0, 120)}...
//                   </p>

//                   {/* Meta Info */}
//                   <div style={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: '0.5rem',
//                     fontSize: '0.75rem',
//                     color: 'var(--muted)',
//                     borderTop: '1px solid var(--border)',
//                     paddingTop: '1rem'
//                   }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                       <span>📍</span>
//                       <span>{resource.location?.type || 'Remote'}</span>
//                     </div>
//                     {resource.duration && (
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         <span>⏱️</span>
//                         <span>{resource.duration}</span>
//                       </div>
//                     )}
//                     {resource.deadline && (
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         <span>📅</span>
//                         <span>Deadline: {formatDate(resource.deadline)}</span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Apply Button */}
// <button
//   className="btn btn-secondary"
//   style={{
//     width: '100%',
//     marginTop: '0.5rem',
//     fontSize: '0.875rem'
//   }}
//   onClick={async (e) => {
//     e.stopPropagation(); // Prevent card click
//     try {
//       const formData = new FormData();
//       formData.append('resourceId', resource._id);

//       // Optional: include resume if you want upload from here
//       // formData.append('resume', selectedFile);

//       await apiHelpers.submitApplication(formData);
//       alert('Application submitted successfully!');
//     } catch (err) {
//       console.error(err);
//       alert(err.message || 'Failed to submit application');
//     }
//   }}
// >
//   Apply Now
// </button>


//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {pagination.pages > 1 && (
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 gap: '0.5rem',
//                 marginTop: '2rem'
//               }}>
//                 <button
//                   onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
//                   disabled={pagination.page === 1}
//                   className="btn"
//                   style={{
//                     opacity: pagination.page === 1 ? 0.5 : 1,
//                     cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   ← Previous
//                 </button>

//                 <div style={{
//                   display: 'flex',
//                   gap: '0.25rem'
//                 }}>
//                   {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
//                     <button
//                       key={pageNum}
//                       onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
//                       className={pageNum === pagination.page ? 'btn btn-primary' : 'btn'}
//                       style={{
//                         minWidth: '40px',
//                         padding: '0.5rem'
//                       }}
//                     >
//                       {pageNum}
//                     </button>
//                   ))}
//                 </div>

//                 <button
//                   onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
//                   disabled={pagination.page === pagination.pages}
//                   className="btn"
//                   style={{
//                     opacity: pagination.page === pagination.pages ? 0.5 : 1,
//                     cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   Next →
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       <style>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//       `}</style>
//     </main>
//   );
// };

// export default Search;