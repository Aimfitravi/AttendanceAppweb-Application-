import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import Pagination from 'react-js-pagination';
import './css/DisplayData.css';

const DisplayUserData = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 8; // Set the number of items per page
  const userName = localStorage.getItem('userName');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    fetch(`http://localhost:8080/attendence/allAttendence/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const convertedData = data.data.map((user) => ({
          ...user,
          date: convertToIndianDate(user.date),
          singInTime: convertToIndianTime(user.singInTime),
          signOutTime: convertToIndianTime(user.signOutTime),
        }));

        convertedData.forEach((obj, index) => {
          if (obj.singInTime === 'Invalid date' && obj.signOutTime === 'Invalid date') {
            obj.singInTime = obj.signOutTime = 'Absent';
          }
          if (obj.singInTime !== 'Invalid date' && obj.signOutTime === 'Invalid date') {
            obj.signOutTime = 'Pending';
          }
        });

        setUserData(convertedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const calculateTotalForDay = (dataForDay) => {
    let totalMinutes = 0;

    dataForDay.forEach((user) => {
      if (user.signOutTime.toLowerCase() !== 'pending' && user.singInTime !== 'Invalid date') {
        const startMoment = moment(user.singInTime, 'hh:mm:ss A');
        const endMoment = moment(user.signOutTime, 'hh:mm:ss A');
        const duration = moment.duration(endMoment.diff(startMoment));
        totalMinutes += duration.asMinutes();
      }
    });

    const status = !isNaN(totalMinutes) ? totalMinutes < 10 ? 'Half Day' : 'Full Day' :'Absent';

    const hours =  ! isNaN(totalMinutes) ?  Math.floor(totalMinutes / 60) : 0 ;
    const minutes = ! isNaN(totalMinutes) ?  Math.floor(totalMinutes % 60) : 0;

    return {
      totalHours: `${hours}h ${minutes}m`,
      status,
    };
  };

  const groupDataByDate = (data) => {
    const groupedData = {};
    data.forEach((user) => {
      const date = user.date;
      if (!groupedData[date]) {
        groupedData[date] = [];
      }

      groupedData[date].push(user);
    });

    const result = [];
    Object.entries(groupedData).forEach(([date, dataForDay]) => {
      const userStatus = calculateTotalForDay(dataForDay);
      result.push({
        date,
        entries: dataForDay,
        totalHours: userStatus.totalHours,
        status: userStatus.status,
      });
    });

    return result;
  };

  const convertToIndianDate = (dateTimeString) => {
    return moment(dateTimeString).tz('Asia/Kolkata').format('MMMM DD, YYYY');
  };

  const convertToIndianTime = (dateTimeString) => {
    return moment(dateTimeString).tz('Asia/Kolkata').format('hh:mm:ss A');
  };

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userData.slice(indexOfFirstItem, indexOfLastItem);
  const groupedData = groupDataByDate(currentItems);

  return (
    <>
      <div className="parent-card" style={{ width: '80%' }}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="card" style={{ width: '95%' }}>
            <div className="user-list">
              <p>
                <h3 style={{ color: 'blue' }}> Welcome , {userName}</h3>
              </p>
              <table>
                <thead >
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>SignIn Time</th>
                    <th>SignOut Time</th>
                    <th>Total Hour's</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedData.map((user, index) => (
                    <React.Fragment key={index}>
                      <tr style={{backgroundColor:"black"}}>
                        <td style={{ color: "red" }}>{index + 1}</td>
                        <td style={{ color: "red" }}>{user.date}</td>
                        {/* Dummy cell for spacing */}
                        <td colSpan="2">{/* Dummy cell for spacing */}</td>
                        <td style={{ color: "red" }}>
                          {user.totalHours}
                        </td>
                        <td style={{ color: "green" }}>{user.status}</td>
                      </tr>
                      {user.entries.map((entry, entryIndex) => (
                        <tr key={entryIndex}>
                          <td>{entry.id}</td>
                          <td>{entry.date}</td>
                          <td>{entry.singInTime}</td>
                          <td>{entry.signOutTime}</td>
                          
                          <td colSpan="2">{/* Dummy cell for spacing */}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <div className="pagination-container">
                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={userData.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                  itemClass={`page-item ${activePage === currentPage ? 'active' : ''}`}
                  linkClass="page-link"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DisplayUserData;
