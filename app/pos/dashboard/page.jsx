"use client";
import Link from 'next/link';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import $ from 'jquery';
// import 'datatables.net-bs4';
// import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import { useRouter } from 'next/navigation'; 
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { ArrowLeftToLine , Calendar ,DollarSign ,AlertCircle ,Folder , Blocks , User2 ,LogOut ,LaptopMinimal ,
    Pencil,Eraser,Logs,ClipboardList ,X,Eye
} from 'lucide-react'; // Importing the icon from lucide-react
import { FaSun, FaMoon } from 'react-icons/fa'; // Ensure this is correct

import '../../../public/css/sb-admin-2.css'; // Ensure this path is correct

import './styles.css';


import { Chart, ArcElement, PieController, BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register the required components, including PointElement
Chart.register(ArcElement, PieController, BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);






const Dashboard = () => {
    const router = useRouter(); 
    const [activePage, setActivePage] = useState('dashboard'); // Track active menu
    const [darkMode, setDarkMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [monthlySales, setMonthlySales] = useState(null);
    const [currentMonth, setCurrentMonth] = useState('');
    const [annualSales, setAnnualSales] = useState(null);
    const [currentYear, setCurrentYear] = useState('');
    const [topProducts, setTopProducts] = useState([]);
    const [revenueData, setRevenueData] = useState([]); 
    const [lowStockItems, setLowStockItems] = useState([]);
    const [showLowStockModal, setShowLowStockModal] = useState(false); 

    const [totalOrders, setTotalOrders] = useState(null);
    const [todayOrders, setTodayOrders] = useState(null);

    const [userStoreId, setUserStoreId] = useState(null); // Store user store ID
    const [categories, setCategories] = useState([]);

    const [manageCategories, setManageCategories] = useState([]); // Initialize with an empty array
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [manageProducts, setManageProducts] = useState([]);
    const [sortConfigProducts, setSortConfigProducts] = useState({ key: null, direction: null }); // Sorting configuration for products


    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState([]); // Initialize products as an empty array

    const [orders, setOrders] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Define error state

    const [selectedDate, setSelectedDate] = useState('');


    const paginatedOrders = orders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);


    const filteredOrders = paginatedOrders.filter(order => {
        const matchesTransactionId = order.transaction_id.includes(searchTerm);
        const matchesDate = selectedDate
            ? new Date(order.created_at).toLocaleDateString('th-TH') === new Date(selectedDate).toLocaleDateString('th-TH')
            : true;

        return matchesTransactionId && matchesDate;
    });


const openLowStockModal = () => {
    setShowLowStockModal(true);
};

const closeLowStockModal = () => {
    setShowLowStockModal(false);
};




    const viewReceipt = (order) => {
        setSelectedOrder(order);
        setShowReceipt(true);
    };

    // Close receipt modal
    const closeReceipt = () => {
        setShowReceipt(false);
        setSelectedOrder(null);
    };



    const fetchOrders = async () => {
        setLoading(true);
        setError(null); // Reset the error state before fetching
        try {
            const response = await fetch(`/api/payments/${userStoreId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders when component mounts
    useEffect(() => {
        if (userStoreId) {
            fetchOrders();
        }
    }, [userStoreId]);

    const toggleTheme = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        document.documentElement.classList.toggle('dark', newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };
    useEffect(() => {
        if (typeof window !== 'undefined') {
          // Your client-side specific code, e.g., localStorage access
          const savedTheme = localStorage.getItem('theme');
          setDarkMode(savedTheme === 'dark');
        }
      }, []);
      
      useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
        } else {
          setDarkMode(false);
          document.documentElement.classList.remove('dark');
        }
      }, []);
      
    const goToPosPage = () => {
        router.push('/pos');
        // Trigger a page reload after navigation with a short delay
        setTimeout(() => {
            window.location.reload();
        }, 100); // Adjust the delay as needed
    };

    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //       $(document).ready(function () {
    //         $('#categoriesTable').DataTable();
    //       });
    //     }
    //   }, []);
      

      useEffect(() => {
        // Dynamically import jQuery and DataTables on the client side only
        const loadScripts = async () => {
          if (typeof window !== 'undefined') {
            // Dynamically import jQuery
            const jQuery = (await import('jquery')).default;
            window.$ = window.jQuery = jQuery;
    
            // Dynamically import DataTables after jQuery
            await import('datatables.net-bs4');
            await import('datatables.net-bs4/css/dataTables.bootstrap4.min.css');
    

          }
        };
    
        loadScripts();
      }, []);
    
    const handleLogout = async () => {
        Swal.fire({
            title: 'คุณต้องการออกจากระบบหรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ออกจากระบบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            customClass: {
                confirmButton: 'custom-confirm-button',
                cancelButton: 'custom-cancel-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',  
                confirmButton: 'font-thai',
                cancelButton: 'font-thai',
            },
            willOpen: () => {

                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                const confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.style.fontSize = '24px'; 
                confirmButton.style.padding = '6px 24px';
                confirmButton.style.backgroundColor = '#4CAF50'; 
                confirmButton.style.color = '#fff'; 
                const cancelButton = document.querySelector('.swal2-cancel');
                cancelButton.style.fontSize = '24px';
                cancelButton.style.padding = '6px 24px';
                cancelButton.style.backgroundColor = '#f44336'; 
                cancelButton.style.color = '#fff'; 
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('/api/logout', {
                        method: 'POST',
                    });
            
                    if (response.ok) {
                        Swal.fire({
                            title: 'ออกจากระบบสำเร็จ',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            router.push('/session/sign-in');
                        });

                    } else {
                        Swal.fire('Error', 'การออกจากระบบล้มเหลว', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
                }
            }
        });
    };
    


    const setActivePageWithStorage = (page) => {
        setActivePage(page);
        localStorage.setItem('activePage', page); // Save the active page to localStorage
        if (page === 'dashboard') {
            fetchLowStockItems(); // โหลดข้อมูลสินค้าคงคลังที่เหลือน้อย
            fetchCurrentMonthSales(); // โหลดข้อมูลยอดขายรายเดือน
            fetchCurrentYearSales(); // โหลดข้อมูลยอดขายรายปี
            fetchSalesData(); // โหลดข้อมูลยอดขายและแสดงกราฟ
            fetchRevenueData(); // โหลดข้อมูลกราฟทันทีหลังจากคลิก
            fetchTopSellingProducts();
        }
    };

    // useEffect(() => {
    //     const fetchCategories = async () => {
    //         try {
    //             const response = await fetch(`/api/categories/manage-categories/${userStoreId}`);
    //             const data = await response.json();
    //             setCategories(data); // Set categories in state
    //         } catch (error) {
    //             console.error('Error fetching categories:', error);
    //         }
    //     };
    
    //     if (userStoreId) {
    //         fetchCategories(); // Fetch categories based on store ID
    //     }
    // }, [userStoreId]); // This runs when userStoreId changes
    

    useEffect(() => {
        if(activePage ==='manageCategories' && userStoreId){
            fetchCategories();
        }

        if (activePage === 'manageProducts' && userStoreId) {
            fetchProducts();
        }
        
        if (activePage === 'manageOrderList' && userStoreId) {
            fetchOrders();
        }
    }, [activePage, userStoreId]);
    
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSortProducts = (key) => {
        let direction = 'ascending';
        if (sortConfigProducts.key === key && sortConfigProducts.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfigProducts({ key, direction });
    };
    
    
    
    // ฟังก์ชันสำหรับการจัดเรียงข้อมูลจริง
    const sortedCategories = Array.isArray(manageCategories) && manageCategories.length > 0 
    ? [...manageCategories].sort((a, b) => {
        if (sortConfig.key) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    }) 
    : []; // Return an empty array if there's no data

    const sortedProducts = Array.isArray(manageProducts) && manageProducts.length > 0 
    ? [...manageProducts].sort((a, b) => {
        if (sortConfigProducts.key) {
            if (a[sortConfigProducts.key] < b[sortConfigProducts.key]) {
                return sortConfigProducts.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfigProducts.key] > b[sortConfigProducts.key]) {
                return sortConfigProducts.direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    }) 
    : []; // Return an empty array if there's no data

    
    const filteredProducts = sortedProducts.filter((product) => {
        const productName = product.product_name ? product.product_name.toLowerCase() : '';
        const productDescription = product.description ? product.description.toLowerCase() : '';
        const productCategory = categories.find(category => category.id === product.category_id)?.name.toLowerCase() || ''; // Find the category name for each product
    
        return (
            productName.includes(searchTerm.toLowerCase()) || 
            productDescription.includes(searchTerm.toLowerCase()) ||
            productCategory.includes(searchTerm.toLowerCase()) || // Search by category name
            product.price.toString().includes(searchTerm) // Convert price to string before comparison
        );
    }).slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    
    
    

    const filteredCategories = sortedCategories
    .filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleProductPageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch('/api/get-user');
                if (response.ok) {
                    const userData = await response.json();
                    setUserStoreId(userData.store_id); // Store store_id in state
                } else {
                    const errorData = await response.json();
                    console.error('Error fetching user data:', errorData.message); // Log the specific error message

                    // Display error alert using SweetAlert2
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด!',
                        text: errorData.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้',
                        confirmButtonText: 'ตกลง',
                    }).then(() => {
                        router.push('/session/sign-in');
                        window.location.reload();
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);

                // Display error alert using SweetAlert2
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: 'ไม่สามารถติดต่อกับเซิร์ฟเวอร์ได้',
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    router.push('/session/sign-in');
                    window.location.reload();
                });
            }
        }

        fetchUserData();
    }, []);



    // Effect to initialize sidebar state from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedSidebarState = localStorage.getItem('sidebarOpen');
            setIsSidebarOpen(storedSidebarState === "false" ? false : true); // Default to true if not set
        }
    }, []);

    // Toggle Sidebar function
    const toggleSidebar = () => {
        setIsSidebarOpen((prevState) => {
            const newState = !prevState;
            // Save the new sidebar state to localStorage
            localStorage.setItem("sidebarOpen", newState);
            return newState;
        });
    };

    // Fetch sales data based on store_id


    const fetchLowStockItems = async () => {
        try {
            const response = await fetch(`/api/graphs/product/low-stock?store_id=${userStoreId}`);
            const data = await response.json();
            console.log('Low stock items:', data); // Log the data to see its structure
            setLowStockItems(data); // Set low stock items to state
        } catch (error) {
            console.error('Error fetching low stock items:', error);
        }
    };

    useEffect(() => {
        if (userStoreId) {
            fetchLowStockItems();
        }
    }, [userStoreId]);
    
    // ฟังก์ชันสำหรับโหลดข้อมูลยอดขายรายเดือน
    const fetchCurrentMonthSales = async () => {
        try {
            const response = await fetch(`/api/graphs/sale-overview/sale-month?store_id=${userStoreId}`);
            const data = await response.json();
            if (data && data[0]) {
                setMonthlySales(data[0].total_sales); // Set monthly sales to state
            }
        } catch (error) {
            console.error('Error fetching current month sales:', error);
        }
    
        const now = new Date();
        const monthName = now.toLocaleString('th-TH', { month: 'long', year: 'numeric' });
        setCurrentMonth(monthName); // Set the current month in Thai format
    };

    useEffect(() => {
        if (userStoreId) {
            fetchCurrentMonthSales();
        }
    }, [userStoreId]);
    
    
    // ฟังก์ชันสำหรับโหลดข้อมูลยอดขายรายปี
    const fetchCurrentYearSales = async () => {
        try {
            const response = await fetch(`/api/graphs/sale-overview/sale-year?store_id=${userStoreId}`);
            const data = await response.json();
            if (data && data[0]) {
                setAnnualSales(data[0].total_sales); // Set annual sales to state
            }
        } catch (error) {
            console.error('Error fetching annual sales:', error);
        }
    
        const now = new Date();
        const year = now.getFullYear();
        setCurrentYear(year); // Set the current year
    };

    useEffect(() => {
        if (userStoreId) {
            fetchCurrentYearSales();
        }
    }, [userStoreId]);

    const fetchTotalOrders = async () => {
        try {
            const response = await fetch(`/api/graphs/product/total-orders?store_id=${userStoreId}`);
            const data = await response.json();
            setTotalOrders(data.totalOrders); // Set total orders count to state
        } catch (error) {
            console.error('Error fetching total orders:', error);
        }
    };
    
    useEffect(() => {
        if (userStoreId) {
            fetchTotalOrders();
        }
    }, [userStoreId]);

    const fetchTodayOrders = async () => {
        try {
            const response = await fetch(`/api/graphs/product/today-orders?store_id=${userStoreId}`);
            const data = await response.json();
            setTodayOrders(data.todayOrders); // Set total orders count to state
        } catch (error) {
            console.error('Error fetching total orders:', error);
        }
    };

    useEffect(() => {
        if (userStoreId) {
            fetchTodayOrders();
        }
    }, [userStoreId]);
    


    let revenueChartInstance = null; // Global variable to store the chart instance

    const loadRevenueChart = (revenueData, darkMode) => {
        if (!revenueData || revenueData.length === 0) {
            console.error('No revenue data available for charting');
            return;
        }
    
        const categoryNames = revenueData.map(item => item.category_name);
        const totalRevenue = revenueData.map(item => item.totalRevenue);
    
        const canvas = document.getElementById('revenueChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
    
            // Destroy the existing chart instance if it already exists
            if (revenueChartInstance) {
                revenueChartInstance.destroy();
                revenueChartInstance = null; // Reset the instance variable
            }
    
            // Set font color based on dark mode
            const fontColor = darkMode ? '#fff' : '#333';
    
            // Create a new chart instance (Horizontal Bar Chart)
            revenueChartInstance = new Chart(ctx, {
                type: 'bar', // ใช้ 'bar' เช่นเดิม
                data: {
                    labels: categoryNames,
                    datasets: [{
                        label: 'ยอดขายตามหมวดหมู่',
                        data: totalRevenue,
                        backgroundColor: [
                            'rgba(78, 115, 223, 0.7)',
                            'rgba(28, 200, 138, 0.7)',
                            'rgba(255, 193, 7, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                        ],
                        borderColor: 'rgba(255, 255, 255, 1)', // White border for contrast
                        borderWidth: 2,
                    }]
                },
                options: {
                    indexAxis: 'y', // บอก Chart.js ให้แกน Y เป็นแกนหมวดหมู่ (ทำให้กราฟเป็นแนวนอน)
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { // กำหนดการตั้งค่าของแกน X (ซึ่งจะเป็นแกนแนวนอนในกราฟนี้)
                            beginAtZero: true,
                            ticks: {
                                color: fontColor, // X-axis font color
                            },
                            grid: {
                                color: darkMode ? '#444' : '#ddd', // Grid line color
                            },
                        },
                        y: { // กำหนดการตั้งค่าของแกน Y (ซึ่งจะเป็นแกนหมวดหมู่)
                            ticks: {
                                color: fontColor, // Y-axis font color
                            },
                            grid: {
                                color: darkMode ? '#444' : '#ddd', // Grid line color
                            },
                        },
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                },
                                color: fontColor, // Use the dynamic font color
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    const index = tooltipItem.dataIndex;
                                    const revenue = new Intl.NumberFormat('th-TH', {
                                        style: 'currency',
                                        currency: 'THB',
                                    }).format(totalRevenue[index]);
                                    return `${categoryNames[index]}: ${revenue}`;
                                },
                                title: function() {
                                    return 'ยอดขายตามหมวดหมู่'; // Title for the tooltip
                                },
                            },
                            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark background for tooltip
                            titleColor: '#fff', // Tooltip title color
                            bodyColor: '#fff', // Tooltip body color
                        }
                    },
                }
            });
        } else {
            console.error('Canvas element with id "revenueChart" not found');
        }
    };
    
    
    
    
    // Fetch revenue data and load chart
    const fetchRevenueData = async () => {
        try {
            const response = await fetch(`/api/graphs/revenue?store_id=${userStoreId}`);
            const data = await response.json();
            console.log("Revenue Data:", data); // Log the data for debugging
    
            if (response.ok) {
                setRevenueData(data); // Assuming you have a state to hold revenue data
            } else {
                console.error('Error fetching revenue data:', data.error);
            }
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        }
    };
    
// useEffect to fetch revenue data when userStoreId is available
useEffect(() => {
    if (userStoreId) {
        fetchRevenueData(); // Fetch data and load chart
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
        if (revenueChartInstance) {
            revenueChartInstance.destroy();
            revenueChartInstance = null; // Reset the instance variable
        }
    };
}, [userStoreId]); // Re-run the effect when userStoreId changes

// useEffect to load the chart when revenueData or darkMode is updated
useEffect(() => {
    if (revenueData && revenueData.length > 0) {
        loadRevenueChart(revenueData, darkMode); // Pass darkMode to loadRevenueChart
    }

    // Cleanup function to destroy the chart if revenueData or darkMode changes
    return () => {
        if (revenueChartInstance) {
            revenueChartInstance.destroy();
            revenueChartInstance = null; // Reset the instance variable
        }
    };
}, [revenueData, darkMode]); // Re-run the effect when revenueData or darkMode changes

    


    let topSellingChartInstance = null; // Global variable to store the chart instance

    const loadTopSellingChart = (topProducts) => {
        if (!topProducts || topProducts.length === 0) {
            console.error('No top-selling products available for charting');
            return;
        }
    
        const productNames = topProducts.map(product => product.product_name);
        const productSales = topProducts.map(product => product.total_sold);
    
        const canvasElement = document.getElementById('productChart');
        if (!canvasElement) {
            console.error('Cannot find productChart element');
            return; // Stop execution if the element is not found
        }
    
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
            console.error('Cannot get context for productChart');
            return;
        }
    
        // Destroy the existing chart instance if it already exists
        if (topSellingChartInstance) {
            topSellingChartInstance.destroy();
            topSellingChartInstance = null; // Reset the instance variable
        }
    
        // Create a new chart instance
        try {
            topSellingChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: productNames,
                    datasets: [{
                        label: 'ยอดจำหน่ายรวม (ชิ้น)',
                        data: productSales,
                        backgroundColor: '#4e73df',
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true },
                        x: { beginAtZero: true }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating the chart:', error);
        }
    };
    
    // Fetch top-selling products and load chart
    const fetchTopSellingProducts = async () => {
        try {
            const response = await fetch(`/api/graphs/product/top-selling?store_id=${userStoreId}`);
            const data = await response.json();
            setTopProducts(data);
        } catch (error) {
            console.error('Error fetching top-selling products:', error);
        }
    };
    
    // useEffect to fetch top-selling products when userStoreId is available
    useEffect(() => {
        if (userStoreId) {
            fetchTopSellingProducts();
        }
    
        // Cleanup function to destroy the chart when the component unmounts
        return () => {
            if (topSellingChartInstance) {
                topSellingChartInstance.destroy();
                topSellingChartInstance = null; // Reset the instance variable
            }
        };
    }, [userStoreId]);
    
    // useEffect to load the chart when topProducts is updated
    useEffect(() => {
        if (topProducts.length > 0) {
            loadTopSellingChart(topProducts);
        }
    
        // Cleanup function to destroy the chart if topProducts changes or component unmounts
        return () => {
            if (topSellingChartInstance) {
                topSellingChartInstance.destroy();
                topSellingChartInstance = null; // Reset the instance variable
            }
        };
    }, [topProducts]);
    


let salesChartInstance = null; // Variable to store the chart instance

const loadCharts = (salesData) => {
    if (!Array.isArray(salesData) || salesData.length === 0) {
        console.error('No sales data available for charting');
        return;
    }

    const salesDates = salesData.map(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    });

    const totalSales = salesData.map(sale => sale.total_sales);

    const salesChartCanvas = document.getElementById('salesChart');
    if (salesChartCanvas) {
        // Destroy the existing chart instance if it already exists
        if (salesChartInstance) {
            salesChartInstance.destroy();
            salesChartInstance = null; // Reset the instance variable
        }

        // Create a new chart instance
        salesChartInstance = new Chart(salesChartCanvas, {
            type: 'line',
            data: {
                labels: salesDates,
                datasets: [{
                    label: "ยอดขายรวม (บาท)",
                    data: totalSales,
                    backgroundColor: "rgba(78, 115, 223, 0.05)",
                    borderColor: "rgba(78, 115, 223, 1)",
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: { time: { unit: 'day' } },
                    y: { 
                        ticks: {
                            beginAtZero: true,
                            callback: function(value) {
                                return new Intl.NumberFormat('th-TH', {
                                    style: 'currency',
                                    currency: 'THB',
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.error('Canvas element with id "salesChart" not found');
    }
};

const fetchSalesData = async () => {
    try {
        const response = await fetch(`/api/graphs/sale-overview?store_id=${userStoreId}`);
        const data = await response.json();
        setSalesData(data); // Set sales data to state
    } catch (error) {
        console.error('Error fetching sales data:', error);
    }
};

useEffect(() => {
    if (userStoreId) {
        fetchSalesData();
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
        if (salesChartInstance) {
            salesChartInstance.destroy();
            salesChartInstance = null; // Reset the instance variable
        }
    };
}, [userStoreId]);

useEffect(() => {
    if (salesData && salesData.length > 0) {
        loadCharts(salesData);
    }

    // Cleanup function to destroy the chart if salesData changes
    return () => {
        if (salesChartInstance) {
            salesChartInstance.destroy();
            salesChartInstance = null; // Reset the instance variable
        }
    };
}, [salesData]);

   // ประกาศฟังก์ชัน fetchCategories นอก useEffect เพื่อให้ใช้งานได้ในทุกส่วนของ component
const fetchCategories = async () => {
    try {
        const response = await fetch(`/api/categories/manage-categories/${userStoreId}`);
        const data = await response.json();
        console.log('Fetched categories:', data); // ตรวจสอบข้อมูลที่ดึงมา
        setManageCategories(data); // Update categories state

        // ทำลายและสร้าง DataTable ใหม่
        // if ($.fn.DataTable.isDataTable('#categoriesTable')) {
        //     $('#categoriesTable').DataTable().clear().destroy();
        // }

        // $('#categoriesTable').DataTable({
        //     responsive: true,
        //     paging: true,
        //     searching: true,
        //     autoWidth: false,
        //     language: {
        //         search: "ค้นหา:",
        //         paginate: {
        //             first: "หน้าแรก",
        //             last: "หน้าสุดท้าย",
        //             next: "ถัดไป",
        //             previous: "ก่อนหน้า"
        //         },
        //         lengthMenu: "แสดง _MENU_ รายการ",
        //         zeroRecords: "ไม่พบข้อมูลที่ตรงกัน",
        //     },
        // });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};
useEffect(() => {
    if (userStoreId) {
        fetchCategories();
    }
}, [userStoreId]);
const fetchProducts = async () => {
    try {
        const response = await fetch(`/api/products/manage-products/${userStoreId}`);
        const data = await response.json();
        console.log('Fetched products:', data); // ตรวจสอบข้อมูลที่ดึงมา
        setManageProducts(data); // Update products state

        // Check if table exists, then destroy it before re-initializing
        // if ($.fn.DataTable.isDataTable('#productsTable')) {
        //     $('#productsTable').DataTable().clear().destroy();
        // }

        // // Initialize DataTable after updating the state with fetched data
        // setTimeout(() => {
        //     $('#productsTable').DataTable({
        //         responsive: true,
        //         paging: true,
        //         searching: true,
        //         autoWidth: false,
        //         language: {
        //             search: "ค้นหา:",
        //             paginate: {
        //                 first: "หน้าแรก",
        //                 last: "หน้าสุดท้าย",
        //                 next: "ถัดไป",
        //                 previous: "ก่อนหน้า"
        //             },
        //             lengthMenu: "แสดง _MENU_ รายการ",
        //             zeroRecords: "ไม่พบข้อมูลที่ตรงกัน",
        //         },
        //     });
        // }, 100); // Delay to ensure table content is rendered first
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};

useEffect(() => {
    if (userStoreId) {
        fetchProducts();
    }
}, [userStoreId]);
useEffect(() => {
    const savedPage = localStorage.getItem('activePage');
    if (savedPage) {
        setActivePage(savedPage); // Set the last active page from localStorage
    } else {
        setActivePage('dashboard'); // Set default page to 'dashboard' if no page is saved
    }
}, []);

    

// useEffect(() => {
//     const loadScripts = async () => {
//         // Dynamically import jQuery
//         const jQuery = (await import('jquery')).default;
//         window.$ = window.jQuery = jQuery;

//         // Dynamically import DataTables after jQuery
//         await import('datatables.net-bs5');

//         // Ensure the DOM is fully loaded before initializing DataTables
//         $(document).ready(function () {
//             // Initialize DataTables for both categories and products tables
//             if ($.fn.DataTable.isDataTable('#categoriesTable')) {
//                 $('#categoriesTable').DataTable().clear().destroy();
//             }
//             $('#categoriesTable').DataTable();

//             if ($.fn.DataTable.isDataTable('#productsTable')) {
//                 $('#productsTable').DataTable().clear().destroy();
//             }
//             $('#productsTable').DataTable();
//         });
//     };

//     loadScripts();
// }, [manageCategories, manageProducts]); // Run this whenever manageCategories or manageProducts are updated

    const [editCategory, setEditCategory] = useState({ id: '', name: '', description: '', category_img: '' }); // State for editing category

    const openAddCategory = () => {
        Swal.fire({
            title: '<h2>เพิ่มหมวดหมู่ใหม่</h2>',
            html: `
                <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px;">
    <label for="category-name" style="font-size: 22px; font-weight: bold; margin-bottom: 5px;">ชื่อหมวดหมู่</label>
    <input type="text" id="category-name" class="swal2-input" placeholder="ชื่อหมวดหมู่" style="width: 80%; height: 40px;" />
</div>

<div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px;">
    <label for="category-description" style="font-size: 22px; font-weight: bold; margin-bottom: 5px;">รายละเอียดหมวดหมู่</label>
    <textarea id="category-description" class="swal2-textarea" rows="3" placeholder="รายละเอียดหมวดหมู่" style="width: 80%; height: auto;"></textarea>
</div>

<div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px;">
    <label for="category-img" style="font-size: 22px; font-weight: bold; margin-bottom: 8px;">เลือกรูปภาพหมวดหมู่ (ถ้ามี)</label>
    <input type="file" id="category-img" class="swal2-file-input" accept="image/*" style="width: 80%; height: 40px;" />
</div>

            `,
            focusConfirm: false,
            customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-confirm-button',
                cancelButton: 'custom-cancel-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',  
                confirmButton: 'font-thai',
                cancelButton: 'font-thai',
            },
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#category-name').value;
                const description = Swal.getPopup().querySelector('#category-description').value;
                const imageFile = Swal.getPopup().querySelector('#category-img').files[0];
    
                if (!name || !description) {
                    Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
                    return null;
                }
    
                return { name, description, imageFile };
            },
    
            willOpen: () => {
                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                const confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.style.fontSize = '24px'; 
                confirmButton.style.padding = '6px 24px';
                confirmButton.style.backgroundColor = '#4CAF50'; 
                confirmButton.style.color = '#fff'; 
                const cancelButton = document.querySelector('.swal2-cancel');
                cancelButton.style.fontSize = '24px';
                cancelButton.style.padding = '6px 24px';
                cancelButton.style.backgroundColor = '#f44336'; 
                cancelButton.style.color = '#fff'; 
            }
        }).then((result) => {
            if (result.isConfirmed) {
                addCategory(result.value);
            }
        });
    };

    const openAddProduct = () => {

        const categories = Array.isArray(manageCategories) ? manageCategories : [];

        // Ensure categories is an array or default it to an empty array
        if (categories.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'ข้อผิดพลาด',
                text: 'ไม่พบหมวดหมู่ กรุณาเพิ่มหมวดหมู่ก่อนเพิ่มสินค้า',
                confirmButtonText: 'ตกลง',
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    cancelButton: 'custom-cancel-button',
                    title: 'font-thai',
                    htmlContainer: 'font-thai',
                    confirmButton: 'font-thai',
                    cancelButton: 'font-thai',
                },
                willOpen: () => {
                    document.querySelector('.swal2-title').style.fontSize = '30px'; 
                    document.querySelector('.swal2-html-container').style.fontSize = '25px';
                    const confirmButton = document.querySelector('.swal2-confirm');
                    confirmButton.style.fontSize = '24px'; 
                    confirmButton.style.padding = '6px 24px';
                    confirmButton.style.backgroundColor = '#4CAF50'; 
                    confirmButton.style.color = '#fff'; 
                    const cancelButton = document.querySelector('.swal2-cancel');
                    cancelButton.style.fontSize = '24px';
                    cancelButton.style.padding = '6px 24px';
                    cancelButton.style.backgroundColor = '#f44336'; 
                    cancelButton.style.color = '#fff'; 
                }
            });
            return;
        }
    
        const categoryOptions = categories.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    
        Swal.fire({
            title: '<h2>เพิ่มสินค้าใหม่</h2>',
            html: `
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <label for="product-name" style="font-size: 24px; font-weight: bold; width: 30%;">ชื่อสินค้า</label>
        <input type="text" id="product-name" class="swal2-input" placeholder="ชื่อสินค้า" style="width: 65%; height: 40px;" />
    </div>
    
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <label for="product-code" style="font-size: 24px; font-weight: bold; width: 30%;">รหัสสินค้า</label>
        <input type="text" id="product-code" class="swal2-input" placeholder="รหัสสินค้า" style="width: 65%; height: 40px;" />
    </div>
    
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <label for="category-id" style="font-size: 24px; font-weight: bold; width: 30%;">หมวดหมู่</label>
<select id="category-id" class="swal2-input" style="width: 65%; height: 40px; padding: 0 10px; border: 1px solid #d9d9d9; background-color: white; color: black;">
                                  ${categoryOptions}

                </select>
    </div>
    
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <label for="price" style="font-size: 24px; font-weight: bold; width: 30%;">ราคา</label>
        <input type="number" id="price" class="swal2-input" placeholder="ราคา" style="width: 65%; height: 40px;" />
    </div>
    
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <label for="stock-quantity" style="font-size: 24px; font-weight: bold; width: 30%;">จำนวนคงเหลือ</label>
        <input type="number" id="stock-quantity" class="swal2-input" placeholder="จำนวนคงเหลือ" style="width: 65%; height: 40px;" />
    </div>
    
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <label for="product-img" style="font-size: 24px; font-weight: bold; width: 30%;">เลือกรูปภาพสินค้า</label>
        <input type="file" id="product-img" class="swal2-file-input" accept="image/*" style="width: 65%; height: 40px;" />
    </div>
    
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-confirm-button',
                cancelButton: 'custom-cancel-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',
                confirmButton: 'font-thai',
                cancelButton: 'font-thai',
            },
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#product-name').value;
                const code = Swal.getPopup().querySelector('#product-code').value;
                const categoryId = Swal.getPopup().querySelector('#category-id').value;
                const price = Swal.getPopup().querySelector('#price').value;
                const stockQuantity = Swal.getPopup().querySelector('#stock-quantity').value;
                const imageFile = Swal.getPopup().querySelector('#product-img').files[0];
                if (!name || !code || !price || !stockQuantity) {
                    Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน และเลือกรูปภาพ');
                    return null;
                }
    
                return { name, code, categoryId, price, stockQuantity, imageFile };
            },
            willOpen: () => {
                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                const confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.style.fontSize = '24px'; 
                confirmButton.style.padding = '6px 24px';
                confirmButton.style.backgroundColor = '#4CAF50'; 
                confirmButton.style.color = '#fff'; 
                const cancelButton = document.querySelector('.swal2-cancel');
                cancelButton.style.fontSize = '24px';
                cancelButton.style.padding = '6px 24px';
                cancelButton.style.backgroundColor = '#f44336'; 
                cancelButton.style.color = '#fff'; 
            }
        }).then((result) => {
            if (result.isConfirmed) {
                addProduct(result.value); // Call function to add the new product
            }
        });
    };
    
    
    
    const addProduct = async (productData) => {
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('code', productData.code);
        formData.append('categoryId', productData.categoryId);
        formData.append('price', productData.price);
        formData.append('stockQuantity', productData.stockQuantity);
        formData.append('productImg', productData.imageFile);
    
        try {
            const response = await fetch(`/api/products/manage-products/${userStoreId}`, {
                method: 'POST',
                body: formData,
            });
    
            const result = await response.json();
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'สินค้าถูกเพิ่มเรียบร้อยแล้ว',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'custom-confirm-button',
                        title: 'font-thai',
                        htmlContainer: 'font-thai',
                        confirmButton: 'font-thai',
                    },
                    willOpen: () => {
                        document.querySelector('.swal2-title').style.fontSize = '30px'; 
                        document.querySelector('.swal2-html-container').style.fontSize = '25px';
                        const confirmButton = document.querySelector('.swal2-confirm');
                        confirmButton.style.fontSize = '24px'; 
                        confirmButton.style.padding = '6px 24px';
                        confirmButton.style.backgroundColor = '#4CAF50'; 
                        confirmButton.style.color = '#fff'; 
                    }
                });
    
                fetchProducts(); // Reload products list after adding a new one
            } else {
                Swal.fire('Error', result.message || 'ไม่สามารถเพิ่มสินค้าได้', 'error');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการเพิ่มสินค้า', 'error');
        }
    };
    

    const handleEditProduct = (product) => {
        Swal.fire({
            title: '<h2>แก้ไขสินค้า</h2>',
            html: `
<div style="display: flex; align-items: center; margin-bottom: 10px; width: 100%;">
    <label for="product-name" style="font-size: 24px; font-weight: bold; width: 30%; text-align: left;">ชื่อสินค้า</label>
    <input type="text" id="product-name" class="swal2-input" style="width: 65%; height: 40px;" value="${product.product_name}" placeholder="ชื่อสินค้า" />
</div>

<div style="display: flex; align-items: center; margin-bottom: 10px; width: 100%;">
    <label for="product-code" style="font-size: 24px; font-weight: bold; width: 30%; text-align: left;">รหัสสินค้า</label>
    <input type="text" id="product-code" class="swal2-input" style="width: 65%; height: 40px;" value="${product.product_code}" placeholder="รหัสสินค้า" />
</div>

<div style="display: flex; align-items: center; margin-bottom: 10px; width: 100%;">
    <label for="category-id" style="font-size: 24px; font-weight: bold; width: 30%; text-align: left;">หมวดหมู่</label>
<select id="category-id" class="swal2-input" style="width: 65%; height: 40px; padding: 0 10px; border: 1px solid #d9d9d9; background-color: white; color: black;">
    ${manageCategories.map((category) => 
        `<option value="${category.id}" ${category.id === product.category_id ? 'selected' : ''}>${category.name}</option>`
    ).join('')}
</select>

</div>

<div style="display: flex; align-items: center; margin-bottom: 10px; width: 100%;">
    <label for="price" style="font-size: 24px; font-weight: bold; width: 30%; text-align: left;">ราคา</label>
    <input type="number" id="price" class="swal2-input" style="width: 65%; height: 40px;" value="${product.price}" placeholder="ราคา" />
</div>

<div style="display: flex; align-items: center; margin-bottom: 10px; width: 100%;">
    <label for="stock-quantity" style="font-size: 24px; font-weight: bold; width: 30%; text-align: left;">จำนวนคงเหลือ</label>
    <input type="number" id="stock-quantity" class="swal2-input" style="width: 65%; height: 40px;" value="${product.stock_quantity}" placeholder="จำนวนคงเหลือ" />
</div>

<div style="display: flex; align-items: center; margin-bottom: 10px; width: 100%;">
    <label for="product-img" style="font-size: 24px; font-weight: bold; width: 30%; text-align: left;">เลือกรูปภาพสินค้า</label>
    <input type="file" id="product-img" class="swal2-file-input" accept="image/*" style="width: 65%; height: 40px;" />
</div>

<input type="hidden" id="existing-img" value="${product.img}" />




            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'อัพเดท',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-confirm-button',
                cancelButton: 'custom-cancel-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',
                confirmButton: 'font-thai',
                cancelButton: 'font-thai',
            },
            willOpen: () => {

                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                const confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.style.fontSize = '24px'; 
                confirmButton.style.padding = '6px 24px';
                confirmButton.style.backgroundColor = '#4CAF50'; 
                confirmButton.style.color = '#fff'; 
                const cancelButton = document.querySelector('.swal2-cancel');
                cancelButton.style.fontSize = '24px';
                cancelButton.style.padding = '6px 24px';
                cancelButton.style.backgroundColor = '#f44336'; 
                cancelButton.style.color = '#fff'; 
            },
            preConfirm: () => {
                const updatedProduct = {
                    id: product.id,
                    name: Swal.getPopup().querySelector('#product-name').value,
                    code: Swal.getPopup().querySelector('#product-code').value,
                    category_id: Swal.getPopup().querySelector('#category-id').value,
                    price: Swal.getPopup().querySelector('#price').value,
                    stock_quantity: Swal.getPopup().querySelector('#stock-quantity').value,
                    imageFile: Swal.getPopup().querySelector('#product-img').files[0], // New image file (optional)
                    existingImg: Swal.getPopup().querySelector('#existing-img').value // Existing image path
                };
    
                if (!updatedProduct.name || !updatedProduct.code || !updatedProduct.price || !updatedProduct.stock_quantity) {
                    Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
                    return null;
                }
    
                return updatedProduct;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                updateProduct(result.value); // Call function to update the product
            }
        });
    };
    

    const updateProduct = async (productData) => {
        const formData = new FormData();
        formData.append('id', productData.id);
        formData.append('name', productData.name);
        formData.append('code', productData.code);
        formData.append('categoryId', productData.category_id);
        formData.append('price', productData.price);
        formData.append('stockQuantity', productData.stock_quantity);
    
        if (productData.imageFile) {
            formData.append('productImg', productData.imageFile);
        }
        formData.append('existingImg', productData.existingImg); // Send the existing image path
    
        try {
            const response = await fetch(`/api/products/manage-products/${userStoreId}`, {
                method: 'PUT',
                body: formData,
            });
    
            const result = await response.json();
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'สินค้าถูกอัพเดทเรียบร้อยแล้ว',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'custom-confirm-button',
                        title: 'font-thai',
                        htmlContainer: 'font-thai',
                        confirmButton: 'font-thai'
                    },
                    willOpen: () => {
                        document.querySelector('.swal2-title').style.fontSize = '30px'; 
                        document.querySelector('.swal2-html-container').style.fontSize = '25px';
                        const confirmButton = document.querySelector('.swal2-confirm');
                        confirmButton.style.fontSize = '24px'; 
                        confirmButton.style.padding = '6px 24px';
                        confirmButton.style.backgroundColor = '#4CAF50'; 
                        confirmButton.style.color = '#fff'; 
                    }
                });
                fetchProducts();
            } else {
                Swal.fire('Error', result.message || 'ไม่สามารถอัพเดตสินค้าได้', 'error');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัพเดตสินค้า', 'error');
        }
    };
    
    
    const handleDeleteProduct = async (productId) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "คุณต้องการลบสินค้านี้หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                confirmButton: 'custom-confirm-button',
                cancelButton: 'custom-cancel-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',
                confirmButton: 'font-thai',
                cancelButton: 'font-thai',
            },
            willOpen: () => {
                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                const confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.style.fontSize = '24px'; 
                confirmButton.style.padding = '6px 24px';
                confirmButton.style.backgroundColor = '#4CAF50'; 
                confirmButton.style.color = '#fff'; 
                const cancelButton = document.querySelector('.swal2-cancel');
                cancelButton.style.fontSize = '24px';
                cancelButton.style.padding = '6px 24px';
                cancelButton.style.backgroundColor = '#f44336'; 
                cancelButton.style.color = '#fff'; 
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/products/manage-products/${userStoreId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ productId }), // Send the product ID to delete
                    });
    
                    const data = await response.json();
    
                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'สำเร็จ!',
                            text: 'สินค้าถูกลบเรียบร้อยแล้ว',
                            confirmButtonText :'ตกลง',
                            customClass: {
                                confirmButton: 'custom-confirm-button',
                                cancelButton: 'custom-cancel-button',
                                title: 'font-thai',
                                htmlContainer: 'font-thai',
                                confirmButton: 'font-thai',
                                cancelButton: 'font-thai',
                            },
                            willOpen: () => {
                                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                                const confirmButton = document.querySelector('.swal2-confirm');
                                confirmButton.style.fontSize = '24px'; 
                                confirmButton.style.padding = '6px 24px';
                                confirmButton.style.backgroundColor = '#4CAF50'; 
                                confirmButton.style.color = '#fff'; 
                                const cancelButton = document.querySelector('.swal2-cancel');
                                cancelButton.style.fontSize = '24px';
                                cancelButton.style.padding = '6px 24px';
                                cancelButton.style.backgroundColor = '#f44336'; 
                                cancelButton.style.color = '#fff'; 
                            }
                        });
                        
                        // Reload or update product list
                        await fetchProducts(); // Re-fetch products after deletion
                    } else {
                        Swal.fire('Error', data.message || 'ไม่สามารถลบสินค้าได้', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting product:', error);
                    Swal.fire('Error', 'เกิดข้อผิดพลาดในการลบสินค้า', 'error');
                }
            }
        });
    };
    
    
    
    
    
    const handleEdit = (category) => {
        setEditCategory(category); // Set the category to edit
        
        Swal.fire({
            title: '<h2>แก้ไขหมวดหมู่</h2>',
            html: `
               <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1; margin-right: 20px;">
                    <div style="text-align: left; margin-bottom: 15px;">
                        <label for="category-name" style="font-size: 22px; font-weight: bold; display: block; margin-bottom: 6px;">ชื่อหมวดหมู่</label>
                        <input type="text" id="category-name" class="swal2-input" value="${category.name}" placeholder="Name" />
                    </div>
                    <div style="text-align: left; margin-bottom: 15px;">
                        <label for="category-description" style="font-size: 22px; font-weight: bold; display: block; margin-bottom: 6px;">รายละเอียดหมวดหมู่</label>
                        <textarea id="category-description" class="swal2-textarea" rows="3" placeholder="Description">${category.description}</textarea>
                    </div>
                    <div style="text-align: left; margin-bottom: 15px;">
                        <label for="category-img" style="font-size: 22px; font-weight: bold; display: block; margin-bottom: 6px;">เลือกรูปภาพใหม่ (ถ้ามี)</label>
                <input type="file" id="category-img" class="swal2-file-input" accept="image/*" />
                    </div>
                </div>
                <div style="flex: 1; text-align: center;">
<img id="preview-image" src="${category.category_img || '/default-image.png'}" alt="Category Image" style="max-width: 200px; height: 200px; object-fit: cover; border: 1px solid #ccc; padding: 10px; margin-left: -40px;" />
                </div>
            </div>
            `,
            focusConfirm: false,
            customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-confirm-button',
                cancelButton: 'custom-cancel-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',
                confirmButton: 'font-thai',
                cancelButton: 'font-thai',
            },
            showCancelButton: true,
            confirmButtonText: 'อัพเดท',
            cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#category-name').value;
                const description = Swal.getPopup().querySelector('#category-description').value;
                const imageFile = Swal.getPopup().querySelector('#category-img').files[0]; // Get the uploaded file
    
                if (!name || !description) {
                    Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
                    return null;
                }
    
                return { id: category.id, name, description, imageFile };
            },
            willOpen: () => {
                const categoryImageInput = document.querySelector('#category-img');
                const previewImage = document.querySelector('#preview-image');
                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                const confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.style.fontSize = '24px'; 
                confirmButton.style.padding = '6px 24px';
                confirmButton.style.backgroundColor = '#4CAF50'; 
                confirmButton.style.color = '#fff'; 
                const cancelButton = document.querySelector('.swal2-cancel');
                cancelButton.style.fontSize = '24px';
                cancelButton.style.padding = '6px 24px';
                cancelButton.style.backgroundColor = '#f44336'; 
                cancelButton.style.color = '#fff'; 
                // Preview image change when file input changes
                categoryImageInput.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            previewImage.src = e.target.result; // Update image preview
                        };
                        reader.readAsDataURL(file);
                    } else {
                        previewImage.src = category.category_img || '/default-image.png';
                    }
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                updateCategory(result.value); 
            }
        });
    };
    


    const updateCategory = async ({ id, name, description, imageFile }) => {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('name', name);
        formData.append('description', description);
    
        if (imageFile) {
            formData.append('category_img', imageFile);
        }
    
        try {
            const response = await fetch(`/api/categories/manage-categories/${userStoreId}`, {
                method: 'PUT',
                body: formData, // Sending formData as the body
            });
    
            const result = await response.json();
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'หมวดหมู่ได้รับการแก้ไขแล้ว',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'custom-confirm-button',
                        title: 'font-thai',
                        htmlContainer: 'font-thai',
                        confirmButton: 'font-thai'
                    },
                    willOpen: () => {
                        document.querySelector('.swal2-title').style.fontSize = '30px'; 
                        document.querySelector('.swal2-html-container').style.fontSize = '25px';
                        const confirmButton = document.querySelector('.swal2-confirm');
                        confirmButton.style.fontSize = '24px'; 
                        confirmButton.style.padding = '6px 24px';
                        confirmButton.style.backgroundColor = '#4CAF50'; 
                        confirmButton.style.color = '#fff'; 
                    }
                });
                await fetchCategories();
                await fetchProducts();
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัพเดตหมวดหมู่', 'error');
        }
    };
    
    


      
    const handleDelete = (categoryId) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            html: '<strong>สินค้าในหมวดหมู่นี้จะถูกลบไปด้วย</strong><br>คุณจะไม่สามารถย้อนกลับสิ่งนี้ได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                confirmButton: 'custom-confirm-button',
                cancelButton: 'custom-cancel-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',
                confirmButton: 'font-thai',
                cancelButton: 'font-thai',
            },
            willOpen: () => {
                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                const confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.style.fontSize = '24px'; 
                confirmButton.style.padding = '6px 24px';
                confirmButton.style.backgroundColor = '#4CAF50'; 
                confirmButton.style.color = '#fff'; 
                const cancelButton = document.querySelector('.swal2-cancel');
                cancelButton.style.fontSize = '24px';
                cancelButton.style.padding = '6px 24px';
                cancelButton.style.backgroundColor = '#f44336'; 
                cancelButton.style.color = '#fff'; 
            }
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCategory(categoryId);
            }
        });
    };

    const deleteCategory = async (categoryId) => {
        try {
            const response = await fetch(`/api/categories/manage-categories/${userStoreId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: categoryId }),
            });
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'หมวดหมู่นี้ถูกลบเรียบร้อยแล้ว',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'custom-confirm-button',
                        title: 'font-thai',
                        htmlContainer: 'font-thai',
                        confirmButton: 'font-thai',

                    },
                    willOpen: () => {
                        document.querySelector('.swal2-title').style.fontSize = '30px'; 
                        document.querySelector('.swal2-html-container').style.fontSize = '25px';
                        const confirmButton = document.querySelector('.swal2-confirm');
                        confirmButton.style.fontSize = '24px'; 
                        confirmButton.style.padding = '6px 24px';
                        confirmButton.style.backgroundColor = '#4CAF50'; 
                        confirmButton.style.color = '#fff'; 
                    }
                });
                fetchCategories(); // รีโหลดหมวดหมู่หลังจากการลบสำเร็จ
                fetchProducts();
            } else {
                Swal.fire('Error', 'เกิดข้อผิดพลาดในการลบหมวดหมู่', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
        }
    };
    const addCategory = async (categoryData) => {
        const formData = new FormData();
        formData.append('name', categoryData.name);
        formData.append('description', categoryData.description);
    
        // Only append the image file if it exists (optional image upload)
        if (categoryData.imageFile) {
            formData.append('category_img', categoryData.imageFile); // Append the image file only if provided
        }
    
        try {
            const response = await fetch(`/api/categories/manage-categories/${userStoreId}`, {
                method: 'POST',
                body: formData, // Send formData to the server
            });
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'หมวดหมู่นี้ถูกเพิ่มเรียบร้อยแล้ว',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'custom-confirm-button',
                        title: 'font-thai',
                        htmlContainer: 'font-thai',
                        confirmButton: 'font-thai',
                        cancelButton: 'font-thai',
                        
                    },
                    willOpen: () => {
                        document.querySelector('.swal2-title').style.fontSize = '30px'; 
                        document.querySelector('.swal2-html-container').style.fontSize = '25px';
                        const confirmButton = document.querySelector('.swal2-confirm');
                        confirmButton.style.fontSize = '24px'; 
                        confirmButton.style.padding = '6px 24px';
                        confirmButton.style.backgroundColor = '#4CAF50'; 
                        confirmButton.style.color = '#fff'; 
                    }
                });
    
                // Fetch the latest categories after adding a new one
                await fetchCategories(); // Update the categories state after successful addition
    
                await fetchProducts(); // Optionally fetch products too if needed
            } else {
                const errorData = await response.json();
                console.error('Error adding category:', errorData.message);
                Swal.fire('Error', errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
        }
    };
    

    

    
    
    const renderContent = () => {
        if (activePage === 'dashboard') {
            return (
                <div className="container-fluid">
                {/* Page Heading */}
                <div className={`d-sm-flex align-items-center justify-content-between mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
    <h1 className={`h3 mb-0 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
</div>


                <div className="row">
                <div className="col-xl-3 col-md-6 mb-4">
    <div className="card border-left-info shadow h-100 py-2" 
         style={{ backgroundColor: darkMode ? '#1c1c1e' : '#fff', color: darkMode ? '#fff' : '#333' }}>
        <div className="card-body">
            <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                    {/* แสดงคำสั่งซื้อทั้งหมด */}
                    <div className="font-thai text-uppercase mb-1" 
                         style={{ 
                             fontSize: '26px', 
                             fontWeight: 'bold', 
                             color: darkMode ? '#fff' : '#333' // สีเหลืองในโหมดมืด, สีเข้มในโหมดสว่าง
                         }}>
                        คำสั่งซื้อทั้งหมด {totalOrders !== null ? `(${totalOrders} รายการ)` : '(ไม่มีคำสั่งซื้อ)'}
                    </div>

                    {/* เพิ่มส่วนคำสั่งซื้อของวันนี้ */}
                    <div className="font-thai text-uppercase mb-1" 
                         style={{ 
                             fontSize: '24px', 
                             fontWeight: 'bold', 
                             color: darkMode ? '#ffc107' : '#007bff' // สีแตกต่างกันตามโหมด
                         }}>
                        คำสั่งซื้อวันนี้ {todayOrders !== null ? `(${todayOrders} รายการ)` : '(ไม่มีคำสั่งซื้อ)'}
                    </div>
                </div>
                <div className="col-auto">
                    <Logs 
                        className="h-8 w-8" 
                        style={{ color: darkMode ? '#ffc107' : '#333' }} // ไอคอนปรับตามโหมดมืด/สว่าง
                    />
                </div>
            </div>
        </div>
    </div>
</div>



                    {/* Monthly Earnings (Current Month Only) */}
                    <div className="col-xl-3 col-md-6 mb-4">
    <div className="card border-left-primary shadow h-100 py-2" 
         style={{ backgroundColor: darkMode ? '#1c1c1e' : '#fff', color: darkMode ? '#fff' : '#333' }}>
        <div className="card-body">
            <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                    <div className="font-thai text-primary text-uppercase mb-1" 
                         style={{ fontSize: '26px', fontWeight: 'bold', color: darkMode ? '#90caf9' : '#4e73df' }}>
                        ยอดขายเดือน ({currentMonth})
                    </div>
                    {/* Check if monthlySales has data */}
                    {monthlySales !== null ? (
                        <div className="h3 mb-0 font-weight-bold" 
                             style={{ color: darkMode ? '#fff' : '#333' }}>
                            ฿ {parseFloat(monthlySales).toLocaleString()}
                        </div>
                    ) : (
                        <div className="h3 mb-0 font-weight-bold" 
                             style={{ color: darkMode ? '#ccc' : '#333' }}>
                            ไม่พบข้อมูล
                        </div>
                    )}
                </div>
                <div className="col-auto">
                    <Calendar className="h-8 w-8" style={{ color: darkMode ? '#fff' : '#ccc' }} />
                </div>
            </div>
        </div>
    </div>
</div>


                    {/* Annual Earnings (Current Year Only) */}
                    <div className="col-xl-3 col-md-6 mb-4">
    <div className="card border-left-success shadow h-100 py-2" 
         style={{ backgroundColor: darkMode ? '#1c1c1e' : '#fff', color: darkMode ? '#fff' : '#333' }}>
        <div className="card-body">
            <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                    <div className="font-thai text-success text-uppercase mb-1" 
                         style={{ fontSize: '26px', fontWeight: 'bold', color: darkMode ? '#4caf50' : '#1cc88a' }}>
                        ยอดขายปี ({currentYear})
                    </div>
                    {/* Check if annualSales has data */}
                    {annualSales !== null ? (
                        <div className="h3 mb-0 font-weight-bold" 
                             style={{ color: darkMode ? '#fff' : '#333' }}>
                            ฿ {parseFloat(annualSales).toLocaleString()}
                        </div>
                    ) : (
                        <div className="h3 mb-0 font-weight-bold" 
                             style={{ color: darkMode ? '#ccc' : '#333' }}>
                            ไม่พบข้อมูล
                        </div>
                    )}
                </div>
                <div className="col-auto">
                    <DollarSign className="h-8 w-8" style={{ color: darkMode ? '#fff' : '#ccc' }} />
                </div>
            </div>
        </div>
    </div>
</div>

<div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-left-warning shadow h-100 py-2" 
            style={{ backgroundColor: darkMode ? '#1c1c1e' : '#fff', color: darkMode ? '#fff' : '#333' }}>
            <div className="card-body">
                <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                        <div className="font-thai text-warning text-uppercase mb-1" 
                            style={{ fontSize: '26px', fontWeight: 'bold', color: darkMode ? '#ffc107' : '#f6c23e' }}>
                            สินค้าคงคลังต่ำ {lowStockItems.length > 0 ? `(${lowStockItems.length} รายการ)` : '(ไม่มีสินค้าเหลือน้อย)'}
                        </div>
                        {lowStockItems.length > 0 && (
                            <Eye 
                                className="w-7 h-7 text-blue-600 hover:text-blue-800 transition-transform duration-300 hover:scale-110 cursor-pointer"
                                onClick={() => setShowLowStockModal(true)} // เปิด Modal
                            />

                        )}
                    </div>
                    <div className="col-auto">
                        <AlertCircle className="h-8 w-8" style={{ color: darkMode ? '#fff' : '#ccc' }} />
                    </div>
                </div>
            </div>
        </div>

        {showLowStockModal && (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={closeLowStockModal}
    >
        <div 
            className={`w-full max-w-xl mx-auto font-thai ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} shadow-lg p-6 rounded-lg relative`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}
        >
            <h2 className="text-3xl font-bold mb-6 text-center">
                สินค้าคงเหลือน้อย
            </h2>

            {lowStockItems.length > 0 ? (
                <ul className="space-y-4">
                    {lowStockItems.map((item, index) => (
                        <li key={index} className="flex justify-between items-center border-b pb-2">
                            <span className="text-2xl font-semibold">{index + 1}.</span>
                            <span className="text-2xl flex-grow pl-4">{item.product_name}</span>
                            <span className={`text-2xl font-bold ${item.stock_quantity <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                คงเหลือ {item.stock_quantity} ชิ้น
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xl text-center text-gray-500">ไม่มีสินค้าคงเหลือน้อย</p>
            )}

<button 
    className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-xl flex justify-center items-center group"
    onClick={closeLowStockModal}
>
    <X className="w-6 h-6 mr-2 transition-transform duration-300 group-hover:rotate-90" />
</button>

        </div>
    </div>
)}




    </div>







                </div>
                

                {/* Content Row */}
                <div className="row">
    {/* Sales Overview (Line Chart) */}
    <div className="col-xl-4 col-lg-7">
        <div className="card shadow mb-4" style={{ backgroundColor: darkMode ? '#1c1c1e' : '#fff', color: darkMode ? '#fff' : '#333' }}>
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between font-thai" 
                 style={{ backgroundColor: darkMode ? '#2c2c2e' : '#f8f9fc', color: darkMode ? '#fff' : '#4e73df' }}>
                {/* ปรับขนาดของหัวข้อเป็น px */}
                <h3 className="m-0 font-weight-bold" style={{ fontSize: darkMode ? '24px' : '24px', color: darkMode ? '#4e73df' : '#4e73df' }}>
                    ภาพรวมการขาย
                </h3>
            </div>
            <div className="card-body font-thai">
                {salesData.length > 0 ? (
                    <div className="chart-area">
                        <canvas id="salesChart" style={{ backgroundColor: darkMode ? '#2c2c2e' : '#fff' }}></canvas>
                    </div>
                ) : (
                    <div className="h4 text-center" style={{ color: darkMode ? '#b0b0b0' : '#6c757d' }}>ไม่พบข้อมูล</div>
                )}
            </div>
        </div>
    </div>

    <div className="col-xl-4 col-lg-5">
    <div className="card shadow mb-4" style={{ backgroundColor: darkMode ? '#1c1c1e' : '#fff', color: darkMode ? '#fff' : '#333' }}>
        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between font-thai" 
             style={{ backgroundColor: darkMode ? '#2c2c2e' : '#f8f9fc', color: darkMode ? '#fff' : '#4e73df' }}>
            <h3 className="m-0 font-weight-bold" style={{ fontSize: darkMode ? '24px' : '24px', color: darkMode ? '#4e73df' : '#4e73df' }}>ยอดขายสินค้าในแต่ละชิ้น</h3>
        </div>
        <div className="card-body font-thai">
            {topProducts.length > 0 ? (  // Check if topProducts has items
                <div className="chart-bar">
                    <canvas id="productChart" style={{ backgroundColor: darkMode ? '#2c2c2e' : '#fff' }}></canvas>
                </div>
            ) : (
                <div className="h4 text-center" style={{ color: darkMode ? '#b0b0b0' : '#6c757d' }}>ไม่พบข้อมูล</div>  // Message when no data
            )}
        </div>
    </div>
</div>






                    {/* Revenue Breakdown (Pie Chart) */}
                    <div className="col-xl-4 col-lg-5">
    <div className="card shadow mb-4" style={{ backgroundColor: darkMode ? '#1c1c1e' : '#fff', color: darkMode ? '#fff' : '#333' }}>
        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between font-thai" 
             style={{ backgroundColor: darkMode ? '#2c2c2e' : '#f8f9fc', color: darkMode ? '#fff' : '#4e73df' }}>
            <h3 className="m-0 font-weight-bold" style={{ fontSize: darkMode ? '24px' : '24px', color: darkMode ? '#4e73df' : '#4e73df' }}>จำแนกรายได้ตามหมวดหมู่</h3>
        </div>
        <div className="card-body font-thai">
            {revenueData.length > 0 ? (  // Check if revenueData has items
                <div className="chart-pie pt-4 pb-2">
                    <canvas id="revenueChart" style={{ backgroundColor: darkMode ? '#2c2c2e' : '#fff' }}></canvas>
                </div>
            ) : (
                <div className="h4 text-center" style={{ color: darkMode ? '#b0b0b0' : '#6c757d' }}>ไม่พบข้อมูล</div>  // Message when no data
            )}
        </div>
    </div>
</div>




                {/* Content Row */}
                {/* <div className="row"> */}
                    {/* Top-Selling Products (Bar Chart) */}
   
                
</div>
</div>

            

            );
        } else if (activePage === 'manageCategories') {
            return (
<div className="container-fluid mx-0 p-0 font-thai" style={{ backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: darkMode ? '#fff' : '#000' }}>
    <div className="py-0">
        <div className="flex flex-row mb-1 sm:mb-0 justify-between w-full">
            <h2 className="text-3xl font-bold leading-tight">จัดการหมวดหมู่</h2>
        </div>

        <div className="w-full p-0 overflow-x-auto font-thai">
            <div className="flex justify-between mb-2">
                <div>
                    <button 
                        onClick={openAddCategory} 
                        className="text-2xl bg-green-500 text-white px-3 py-2 rounded"
                        style={{ backgroundColor: darkMode ? '#4CAF50' : '#4CAF50', color: '#fff' }}
                    >
                        เพิ่มหมวดหมู่
                    </button>
                </div>
                <div className="w-1/4">
                    <input
                        type="text"
                        className="text-2xl appearance-none border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:border-gray-500"
                        style={{
                            backgroundColor: darkMode ? '#2c2c2e' : '#fff',
                            color: darkMode ? '#fff' : '#000',
                            borderColor: darkMode ? '#444' : '#d9d9d9',
                        }}
                        placeholder="ค้นหา..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <span className="text-3xl">หน้า {currentPage}</span>
            <table id="categoriesTable" className="min-w-full table-auto text-center" style={{ backgroundColor: darkMode ? '#2c2c2e' : '#fff' }}>
                <thead>
                    <tr className="uppercase text-2xl leading-normal" style={{ backgroundColor: darkMode ? '#3a3a3c' : '#f8f9fa', color: darkMode ? '#fff' : '#000' }}>
                        <th className="py-2 px-6 text-left cursor-pointer" onClick={() => handleSort('name')}>
                            ชื่อ
                            {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th className="py-2 px-6 text-left cursor-pointer" onClick={() => handleSort('description')}>
                            คำอธิบาย
                            {sortConfig.key === 'description' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th className="py-2 px-6 text-left">จำนวนสินค้า</th>
                        <th className="py-2 px-6 text-left">รูปภาพ</th>
                        <th className="py-2 px-6 text-left cursor-pointer" onClick={() => handleSort('date_created')}>
                            สร้างเมื่อ
                            {sortConfig.key === 'date_created' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th className="py-2 px-6 text-center"></th>
                    </tr>
                </thead>
                <tbody className="text-2xl font-light" style={{ color: darkMode ? '#fff' : '#000' }}>
                    {filteredCategories.map((category) => (
                        <tr key={category.id} 
                            className="border-b hover:bg-gray-100" 
                            style={{ 
                                backgroundColor: darkMode ? '#2c2c2e' : '#fff', 
                                borderColor: darkMode ? '#444' : '#eaeaea',
                                transition: 'background-color 0.3s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#444' : '#f0f0f0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#2c2c2e' : '#fff'}
                        >
                            <td className="py-2 px-6 text-left">{category.name}</td>
                            <td className="py-2 px-6 text-left">{category.description}</td>
                            <td className="py-2 px-6 text-left">{category.product_count}</td>
                            <td className="py-2 px-6 text-left">
                                <img
                                    src={category.category_img || '/default-image.png'}
                                    alt="รูปภาพ"
                                    className="w-14 h-14 object-cover"
                                />
                            </td>
                            <td className="py-2 px-6 text-left">
                                {new Date(category.date_created).toLocaleString('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                            <td className="py-2 px-7 text-center">
                            <div className="flex space-x-4 items-center">
                            <Pencil 
  size={40} 
  onClick={() => handleEdit(category)}
  className="text-blue-500 cursor-pointer p-2 rounded hover:text-white transition-colors hover:scale-110 transition-transform"
/>

<Eraser
  size={40}
  onClick={() => handleDelete(category.id)}
  className="text-red-500 cursor-pointer p-2 rounded hover:text-white transition-colors hover:scale-110 transition-transform"
/>
</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="flex justify-between mt-4">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-2xl"
                style={{ backgroundColor: darkMode ? '#3a3a3c' : '#eaeaea', color: darkMode ? '#fff' : '#000' }}
            >
                ก่อนหน้า
            </button>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={filteredCategories.length < rowsPerPage}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-2xl"
                style={{ backgroundColor: darkMode ? '#3a3a3c' : '#eaeaea', color: darkMode ? '#fff' : '#000' }}
            >
                ถัดไป
            </button>
        </div>
    </div>
</div>


            
            
            );            
        } else if (activePage === 'manageProducts') {
            return (
<div className={`container-fluid mx-0 p-0 font-thai ${darkMode ? 'bg-dark-800 text-white' : 'bg-light-100 text-gray-900'}`}>
    <div className="py-0">
        <div className="flex flex-row mb-1 sm:mb-0 justify-between w-full">
            <h2 className="text-3xl font-bold leading-tight">จัดการสินค้า</h2>
        </div>

        <div className="w-full p-0 overflow-x-auto font-thai">
            <div className="flex justify-between mb-2">
                <div>
                    <button 
                        onClick={openAddProduct} 
                        className={`text-2xl px-3 py-2 rounded ${darkMode ? 'bg-green-700 text-white' : 'bg-green-500 text-white'}`}
                    >
                        เพิ่มสินค้า
                    </button>
                </div>
                <div className="w-1/4">
                    <input
                        type="text"
                        className="text-2xl appearance-none border rounded py-2 px-4 leading-tight focus:outline-none"
                        style={{
                            backgroundColor: darkMode ? '#2c2c2e' : '#fff',
                            color: darkMode ? '#fff' : '#000',
                            borderColor: darkMode ? '#444' : '#d9d9d9',
                        }}
                        placeholder="ค้นหา..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <span className="text-3xl">หน้า {currentPage}</span>
            <table className="min-w-full table-auto text-center" style={{ backgroundColor: darkMode ? '#2c2c2e' : '#fff' }}>
                <thead>
                    <tr className="uppercase text-2xl leading-normal" style={{ backgroundColor: darkMode ? '#3a3a3c' : '#f8f9fa', color: darkMode ? '#fff' : '#000' }}>
                        <th className="py-2 px-6 text-left cursor-pointer" onClick={() => handleSortProducts('product_name')}>
                            ชื่อสินค้า
                            {sortConfigProducts.key === 'product_name' && (sortConfigProducts.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th className="py-2 px-6 text-left">หมวดหมู่</th>
                        <th className="py-2 px-6 text-left cursor-pointer" onClick={() => handleSortProducts('product_code')}>
                            รหัสสินค้า
                            {sortConfigProducts.key === 'product_code' && (sortConfigProducts.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th className="py-2 px-6 text-left cursor-pointer" onClick={() => handleSortProducts('price')}>
                            ราคา
                            {sortConfigProducts.key === 'price' && (sortConfigProducts.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th className="py-2 px-6 text-left cursor-pointer" onClick={() => handleSortProducts('stock_quantity')}>
                            จำนวน
                            {sortConfigProducts.key === 'stock_quantity' && (sortConfigProducts.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th className="py-2 px-6 text-left">รูปภาพ</th>
                        <th className="py-2 px-6 text-left cursor-pointer" onClick={() => handleSortProducts('created_at')}>
                            สร้างเมื่อ
                            {sortConfigProducts.key === 'created_at' && (sortConfigProducts.direction === 'ascending' ? ' ↑' : ' ↓')}
                        </th>
                        <th className="py-2 px-6 text-center"></th>
                    </tr>
                </thead>
                <tbody className="text-2xl font-light" style={{ color: darkMode ? '#fff' : '#000' }}>
                    {filteredProducts.map((product) => (
                        <tr key={product.id} 
                            className="border-b" 
                            style={{ 
                                backgroundColor: darkMode ? '#2c2c2e' : '#fff', 
                                borderColor: darkMode ? '#444' : '#eaeaea',
                                transition: 'background-color 0.3s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#444' : '#f0f0f0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#2c2c2e' : '#fff'}
                        >
                            <td className="py-2 px-6 text-left">{product.product_name}</td>
                            <td className="py-2 px-6 text-left">
    {manageCategories.find((category) => category.id === product.category_id)?.name || 'ไม่ทราบหมวดหมู่'}
</td>


                            <td className="py-2 px-6 text-left">{product.product_code}</td>
                            <td className="py-2 px-6 text-left">{product.price}</td>
                            <td className="py-2 px-6 text-left">{product.stock_quantity}</td>
                            <td className="py-2 px-6 text-left">
                                <img
                                    src={product.img || '/default-image.png'}
                                    alt="รูปภาพ"
                                    className="w-14 h-14 object-cover"
                                />
                            </td>
                            <td className="py-2 px-6 text-left">
                                {new Date(product.created_at).toLocaleString('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                            <td className="py-3 px-6 text-center">
                            <div className="flex space-x-4 items-center">
                            <Pencil 
  size={40} 
  onClick={() => handleEditProduct(product)}
  className="text-blue-500 cursor-pointer p-2 rounded hover:text-white transition-colors hover:scale-110 transition-transform"
/>

<Eraser
  size={40}
  onClick={() => handleDeleteProduct(product.id)}
  className="text-red-500 cursor-pointer p-2 rounded hover:text-white transition-colors hover:scale-110 transition-transform"
/>
</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="flex justify-between mt-4">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`bg-gray-300 text-gray-700 text-2xl px-4 py-2 rounded ${darkMode ? 'text-white' : 'text-gray-700'}`}
                style={{ backgroundColor: darkMode ? '#3a3a3c' : '#eaeaea' }}
            >
                ก่อนหน้า
            </button>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={filteredProducts.length < rowsPerPage}
                className={`bg-gray-300 text-gray-700 text-2xl px-4 py-2 rounded ${darkMode ? 'text-white' : 'text-gray-700'}`}
                style={{ backgroundColor: darkMode ? '#3a3a3c' : '#eaeaea' }}
            >
                ถัดไป
            </button>
        </div>
    </div>
</div>

            );
        } else if (activePage === 'manageOrderList') {


            return ( // Add return here
                <div className={`container-fluid mx-0 p-0 font-thai ${darkMode ? 'bg-dark-800 text-white' : 'bg-light-100 text-gray-900'}`}>
                <div className="py-0">
                    <div className="flex flex-row mb-1 sm:mb-0 justify-between w-full">
                        <h2 className="text-3xl font-bold leading-tight">รายการคำสั่งซื้อ</h2>
                    </div>
        
                    {/* Search and Date Filter */}
                    <div className="flex justify-between mb-4">
                        <input
                            type="text"
                            placeholder="ค้นหารหัสการทำรายการ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-2xl px-4 py-2 rounded-lg"
                            style={{
                                backgroundColor: darkMode ? '#2c2c2e' : '#fff',
                                color: darkMode ? '#fff' : '#000',
                                borderColor: darkMode ? '#444' : '#d9d9d9',
                            }}
                        />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={`input input-bordered text-2xl font-bold ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-400 text-black'}`}
                            style={{
                                backgroundColor: darkMode ? '#2c2c2e' : '#fff',
                                color: darkMode ? '#fff' : '#000',
                                borderColor: darkMode ? '#444' : '#d9d9d9',
                            }}
                        />
                    </div>
        
                    <div className="w-full p-0 overflow-x-auto">
                        <table className="min-w-full table-auto text-center" style={{ backgroundColor: darkMode ? '#2c2c2e' : '#fff' }}>
                            <thead>
                                <tr className="uppercase text-2xl leading-normal" style={{ backgroundColor: darkMode ? '#3a3a3c' : '#f8f9fa', color: darkMode ? '#fff' : '#000' }}>
                                    <th className="py-3 px-6 text-left">รหัสการทำรายการ</th>
                                    <th className="py-3 px-6 text-left">จำนวนเงินที่ชำระ</th>
                                    <th className="py-3 px-6 text-left">วิธีการชำระเงิน</th>
                                    <th className="py-3 px-6 text-left">วันที่</th>
                                    <th className="py-3 px-6 text-left"></th>
                                </tr>
                            </thead>
                            <tbody className="text-2xl font-light" style={{ color: darkMode ? '#fff' : '#000' }}>
                                {filteredOrders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((order) => (
                                    <tr key={order.id}
                                        className="border-b"
                                        style={{
                                            backgroundColor: darkMode ? '#2c2c2e' : '#fff',
                                            borderColor: darkMode ? '#444' : '#eaeaea',
                                            transition: 'background-color 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#444' : '#f0f0f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#2c2c2e' : '#fff'}
                                    >
                                        <td className="py-3 px-6 text-left">{order.transaction_id}</td>
                                        <td className="py-3 px-6 text-left">฿{parseFloat(order.paid_amount).toFixed(2)}</td>
                                        <td className="py-3 px-6 text-left">{order.payment_method}</td>
                                        <td className="py-3 px-6 text-left">
                                            {new Date(order.created_at).toLocaleString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                        <Eye
  size={40} 
  onClick={() => viewReceipt(order)}
  className="text-blue-500 cursor-pointer p-2 rounded hover:text-white transition-colors hover:scale-110 transition-transform"
/>
             
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
        
                        {/* Pagination Buttons */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`bg-gray-300 text-gray-700 text-2xl px-4 py-2 rounded ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                style={{ backgroundColor: darkMode ? '#3a3a3c' : '#eaeaea' }}
                            >
                                ก่อนหน้า
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={filteredOrders.length < rowsPerPage}
                                className={`bg-gray-300 text-gray-700 text-2xl px-4 py-2 rounded ${darkMode ? 'text-white' : 'text-gray-700'}`}
                                style={{ backgroundColor: darkMode ? '#3a3a3c' : '#eaeaea' }}
                            >
                                ถัดไป
                            </button>
                        </div>
                    </div>
        
                    {/* Receipt Modal */}
                    {showReceipt && selectedOrder && (
    <div 
        className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50"
        onClick={closeReceipt}
    >
        <div 
            className="w-full max-w-xl mx-auto bg-white text-black shadow-lg p-6 rounded-lg relative"

            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '450px' ,maxHeight: '85vh', overflowY: 'auto' }}
        >
            <h2 className="text-4xl font-bold mb-4 text-center">ใบเสร็จรับเงิน</h2>
            <div className="mb-4">
                <p className="text-3xl"><strong>รหัสการทำรายการ :</strong> {selectedOrder.transaction_id}</p>
                <p className="text-3xl"><strong>วันที่ทำรายการ :</strong> {new Date(selectedOrder.created_at).toLocaleString('th-TH', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })}</p>
                <p className="text-3xl"><strong>จำนวนเงินที่ชำระ :</strong> ฿{parseFloat(selectedOrder.paid_amount).toFixed(2)}</p>
                <p className="text-3xl"><strong>วิธีการชำระเงิน :</strong> {selectedOrder.payment_method}</p>
                <p className="text-3xl"><strong>เงินทอน :</strong> ฿{parseFloat(selectedOrder.change).toFixed(2)}</p>
            </div>

            <h3 className="text-3xl font-bold mt-4 mb-3">รายการสินค้า</h3>
            <ul className="mb-4 space-y-2">
                {JSON.parse(selectedOrder.items).map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                        <span className="text-2xl">{item.quantity}x {item.name}</span>
                        <span className="text-2xl">฿{item.priceBeforeDiscount.toFixed(2)}</span>
                    </li>
                ))}
            </ul>

            <div className="flex justify-between text-3xl font-bold border-t border-gray-300 pt-3 mt-4">
                <span>ยอดรวมทั้งหมด</span>
                <span>฿{parseFloat(selectedOrder.paid_amount).toFixed(2)}</span>
            </div>

            <button 
    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-2xl flex justify-center items-center"
    onClick={closeReceipt}
>
    <X className="w-6 h-6" />
</button>

        </div>
    </div>
)}


                </div>
            </div>
        );
    }
        

    };


    return (
        <>

            {/* Page Wrapper */}
            <div id="wrapper" className={isSidebarOpen ? "" : "toggled"}>
    {/* Sidebar */}
    <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${isSidebarOpen ? "" : "toggled"}`} id="accordionSidebar">
        {/* Sidebar - Brand */}
        <Link href="#" className="sidebar-brand d-flex align-items-center justify-content-center">
            <div className="sidebar-brand-icon rotate-n-15">
                <i className="fas fa-laugh-wink"></i>
            </div>
            {isSidebarOpen && <h3 className="sidebar-brand-text mx-3 font-thai">EZyPOS Dashboard</h3>}
        </Link>

        {/* Divider */}
        <hr className="sidebar-divider my-0" />

        {/* Nav Item - Dashboard */}
        <li className={`nav-item font-thai ${activePage === 'dashboard' ? 'active' : ''}`}>
            <a
                className="nav-link"
                href="#"
                onClick={goToPosPage}
                style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
            >
                <LaptopMinimal style={{ marginLeft: isSidebarOpen ? '10px' : '0' }} />
                {isSidebarOpen && <span style={{ fontSize: '25px', fontWeight: 'bold', marginLeft: '10px' }}>Open POS</span>}
            </a>
        </li>

        {/* Other sidebar items */}
        <hr className="sidebar-divider d-none d-md-block" />

        <li className={`nav-item font-thai ${activePage === 'dashboard' ? 'active' : ''}`}>
            <a
                className="nav-link"
                href="#"
                onClick={() => setActivePageWithStorage('dashboard')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
            >
                <span style={{ fontSize: '24px', fontWeight: 'bold' ,marginLeft: '10px' }}>Dashboard</span>
            </a>
        </li>

        <hr className="sidebar-divider my-0" />

        {/* Heading - Category */}
        <div className="sidebar-heading font-thai" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            เมนูเกี่ยวกับสินค้า
        </div>

        {/* Manage Category */}
        <li className={`nav-item font-thai ${activePage === 'manageCategories' ? 'active' : ''}`}>
            <a
                className="nav-link"
                href="#"
                onClick={() => setActivePageWithStorage('manageCategories')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
            >
                <Folder style={{ marginLeft: isSidebarOpen ? '10px' : '0' }} />
                {isSidebarOpen && <span style={{ fontSize: '23px', fontWeight: 'normal', marginLeft: '10px'  }}>จัดการหมวดหมู่</span>}
            </a>
        </li>

        {/* Manage Products */}
        <li className={`nav-item font-thai ${activePage === 'manageProducts' ? 'active' : ''}`}>
            <a
                className="nav-link"
                href="#"
                onClick={() => setActivePageWithStorage('manageProducts')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
            >
                <Blocks style={{ marginLeft: isSidebarOpen ? '10px' : '0' }} />
                {isSidebarOpen && <span style={{ fontSize: '23px', fontWeight: 'normal', marginLeft: '10px'  }}>จัดการสินค้า</span>}
            </a>
        </li>
        <div className="sidebar-heading font-thai" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            เมนูเกี่ยวกับคำสั่งซื้อ
        </div>
        <li className={`nav-item font-thai ${activePage === 'manageOrderList' ? 'active' : ''}`}>
            <a
                className="nav-link"
                href="#"
                onClick={() => setActivePageWithStorage('manageOrderList')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
            >
                <ClipboardList style={{ marginLeft: isSidebarOpen ? '10px' : '0' }} />
                {isSidebarOpen && <span style={{ fontSize: '23px', fontWeight: 'normal', marginLeft: '10px'  }}>รายการคำสั่งซื้อ</span>}
            </a>
        </li>
        {/* Heading - User Menu */}
        <div className="sidebar-heading font-thai" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            เมนูผู้ใช้งาน
        </div>

        {/* Logout */}
        <li className="nav-item font-thai">
            <a
                className="nav-link"
                href="#"
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
            >
                <LogOut style={{ marginLeft: isSidebarOpen ? '10px' : '0' }} />
                {isSidebarOpen && <span style={{ fontSize: '23px', fontWeight: 'normal', marginLeft: '10px' }}>ออกจากระบบ</span>}
            </a>
        </li>
    </ul>
                {/* End of Sidebar */}

                {/* Content Wrapper */}
                <div
  id="content-wrapper"
  className="d-flex flex-column"
  style={{
    backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', // Dark background for darkMode, light for lightMode
    color: darkMode ? '#FFFFFF' : '#1F2937', // White text for darkMode, dark text for lightMode
}}
>
  {/* Main Content */}
  <div
    id="content"
    style={{
        backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', // Dark background for darkMode, light for lightMode
        color: darkMode ? '#FFFFFF' : '#1F2937', // White text for darkMode, dark text for lightMode
    }}
  >
    {/* Topbar */}
    <nav
      className={`navbar navbar-expand topbar mb-4 static-top shadow d-flex justify-content-between align-items-center`}
      style={{
        backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', // Dark background for darkMode, light for lightMode
        color: darkMode ? '#FFFFFF' : '#1F2937', // White text for darkMode, dark text for lightMode
    }}
    >
{/* ปุ่มสำหรับหน้าจอขนาดเล็ก (มือถือ) */}
<button 
    id="sidebarToggleTop" 
    className={`btn btn-link d-md-none rounded-circle mr-3 ${
        darkMode ? 'text-white' : 'text-black'
    }`} 
    onClick={toggleSidebar}
>
    <ArrowLeftToLine 
        size={24} 
        style={{
            color: darkMode ? 'white' : 'black',
        }}
    />
</button>

{/* ปุ่มสำหรับหน้าจอขนาดใหญ่ */}
<button 
    className={`btn d-none d-md-inline ${
        darkMode ? 'btn-secondary' : 'btn-primary'
    }`} 
    onClick={toggleSidebar}
>
    <ArrowLeftToLine 
        size={24} 
        style={{ 
            transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s ease',
            color: darkMode ? 'white' : 'black', // เปลี่ยนสีของไอคอนตาม darkMode
        }} 
    />
</button>

            {/* Centered Store ID */}
            {/* <h2 className="text-center text-3xl font-semibold mx-auto font-thai">รหัสร้านค้า : {userStoreId}</h2> */}
            <div className="cursor-pointer" onClick={toggleTheme}>
        <div className={`transition-transform duration-500 ${darkMode ? 'rotate-180' : 'rotate-0'}`}>
            {darkMode ? (
                <FaSun className="text-yellow-500 text-2xl transition-colors duration-500 animate-pulse-slow" />
            ) : (
                <FaMoon className="text-blue-800 text-2xl transition-colors duration-500 animate-pulse-slow" />
            )}
        </div>
    </div>

        </nav>

                        {/* End of Topbar */}

                        {/* Begin Page Content */}


                        <div
    className="container-fluid"
    style={{
        backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', // Dark background for darkMode, light for lightMode
        color: darkMode ? '#FFFFFF' : '#1F2937', // White text for darkMode, dark text for lightMode
    }}
>
    {renderContent()}
</div>


                            

                        {/* /.container-fluid */}
                        
                    </div>
                    {/* End of Main Content */}
                </div>
                {/* End of Content Wrapper */}
            </div>
            {/* End of Page Wrapper */}

 {/* Load jQuery first */}
<Script
  src="/vendor/bootstrap/js/bootstrap.bundle.min.js"
  strategy="beforeInteractive"
  onError={(e) => console.error('Error loading Bootstrap:', e)}
/>

<Script
  src="/vendor/datatables/jquery.dataTables.min.js"
  strategy="beforeInteractive"
  onError={(e) => console.error('Error loading DataTables:', e)}
/>
<Script
  src="/vendor/datatables/dataTables.bootstrap4.min.js"
  strategy="beforeInteractive"
  onError={(e) => console.error('Error loading DataTables Bootstrap:', e)}
/>

        </>
    );
}
export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
