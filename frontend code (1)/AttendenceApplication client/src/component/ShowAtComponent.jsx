import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import { useParams } from 'react-router-dom';
import Pagination from 'react-js-pagination';
import './css/adminUserView.css'

import './css/ShowAttendance.css'; // Import your CSS file for this component

const ShowAttendance = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 8; // Set the number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const { userId } = useParams();
  const userName = localStorage.getItem('userName');

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userData.slice(indexOfFirstItem, indexOfLastItem);


  useEffect(() => {
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

  const calculateTotalHours = (startTime, endTime) => {
    const startMoment = moment(startTime, 'hh:mm:ss A');
    const endMoment = moment(endTime, 'hh:mm:ss A');

    // Check if signOutTime is 'pending'
    if (endTime.toLowerCase() === 'pending') {
      return '0h 0m';
    }

    const duration = moment.duration(endMoment.diff(startMoment));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    return `${hours}h ${minutes}m`;
  };



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

    const status = !isNaN(totalMinutes) ? totalMinutes < 10 ? 'Absent' : 'Full Day' : 'Absent';

    const hours = !isNaN(totalMinutes) ? Math.floor(totalMinutes / 60) : 0;
    const minutes = !isNaN(totalMinutes) ? Math.floor(totalMinutes % 60) : 0;

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

  const groupedData = groupDataByDate(currentItems);

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="attendance-container">
          <h2 className="welcome-message">WELCOME , {userName}</h2>
          <h4 className="welcome-message2">( Daily Attendence List)</h4>
          <div className="user-list">

            <table>
              <thead >
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>SignIn Time</th>
                  <th>SignOut Time</th>
                  <th>Total Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map((user, index) => (
                  <React.Fragment key={index}>
                    <tr style={{ backgroundColor: "black" }}>
                      <td style={{ color: "red" }}>{ }</td>
                      <td style={{ color: "red" }}>{user.date}</td>
                      {/* Dummy cell for spacing */}
                      <td colSpan="2">{/* Dummy cell for spacing */}</td>
                      <td style={{ color: "red" }}>
                        {user.totalHours}
                      </td>
                      <td style={{ color: "gray" }}>{user.status}</td>
                    </tr>
                    {user.entries.map((entry, entryIndex) => (
                      <tr key={entryIndex}>
                        <td>{entry.id}</td>
                        <td>{entry.date}</td>
                        <td>{entry.singInTime}</td>
                        <td>{entry.signOutTime}</td>
                        <td>
                          {entry.signOutTime !== 'Absent' &&
                            entry.singInTime !== 'Invalid date' &&
                            entry.singInTime
                            ? calculateTotalHours(entry.singInTime, entry.signOutTime)
                            : '0h 0m '}
                        </td>

                        <td colSpan="2">{/* Dummy cell for spacing */}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {userData.length > itemsPerPage && (
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
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default ShowAttendance;
