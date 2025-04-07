import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Loader from './Loader';

const Home = () => {
  const [films, setFilms] = useState([]);
  const [loadingFilm, setLoadingFilm] = useState(false);
  const [loadingCinema, setLoadingCinema] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      filmName: '',
      radius: 1,
      limit: 1
    }
  });

  useEffect(() => {
    fetchFilms();
    getUserLocation();
  }, []);

  const fetchFilms = async () => {
    try {
      setLoadingFilm(true);
      const response = await axios.get('http://localhost:2808/api/films/all');
      setFilms(response.data);
      setLoadingFilm(false);
    } catch (error) {
      console.error('Error fetching films:', error);
      setLoadingFilm(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.');
        }
      );
    } else {
      setLocationError('Trình duyệt của bạn không hỗ trợ định vị.');
    }
  };

  const selectFilm = (film) => {
    setSelectedFilm(film.title);
    setValue('filmName', film.title);
    setShowModal(false);
  };

  const onSubmit = async (data) => {
    if (!userLocation) {
      setLocationError('Vui lòng cung cấp vị trí để tiếp tục');
      return;
    }

    try {
      setLoadingCinema(true);
      setSearchResults(null);
      const formattedDate = viewDate.toISOString().split('T')[0];
      const response = await axios.post('http://localhost:2808/api/choose/', {
        filmName: data.filmName,
        viewDate: formattedDate,
        location: userLocation,
        radius: Number(data.radius),
        limit: Number(data.limit)
      });

      setSearchResults(response.data);
      setLoadingCinema(false);
    } catch (error) {
      console.error('Error searching cinemas:', error);
      if (error.response && error.response.data) {
        setSearchResults({ error: error.response.data.message });
      } else {
        setSearchResults({ error: 'Đã xảy ra lỗi khi tìm kiếm rạp phim' });
      }
      setLoadingCinema(false);
    }
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 5);
    return maxDate;
  };

  const showEnlargedImage = (imageUrl, cinemaName) => {
    setEnlargedImage({
      url: imageUrl,
      name: cinemaName
    });
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Tìm Rạp Chiếu Phim</h1>
          <p>Khám phá các rạp phim gần bạn với bộ phim yêu thích</p>
        </div>
      </div>

      {loadingCinema ? (
        <Loader />
      ) : (
              <div className="search-container">
              <form onSubmit={handleSubmit(onSubmit)} className="search-form">
                <div className="form-group">
                  <label>
                    <i className="fas fa-film"></i> Chọn Phim
                  </label>
                  <div className="film-select">
                    <input
                      type="text"
                      readOnly
                      placeholder="Chọn phim"
                      value={selectedFilm}
                      onClick={() => setShowModal(true)}
                      className={errors.filmName ? 'error' : ''}
                    />
                    <button type="button" onClick={() => setShowModal(true)} className="select-film-btn">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                  {errors.filmName && <span className="error-message">Vui lòng chọn phim</span>}
                </div>
      
                <div className="form-group">
                  <label>
                    <i className="fas fa-calendar-alt"></i> Ngày Xem
                  </label>
                  <DatePicker
                    selected={viewDate}
                    onChange={(date) => setViewDate(date)}
                    minDate={new Date()}
                    maxDate={getMaxDate()}
                    dateFormat="dd/MM/yyyy"
                    className="datepicker"
                  />
                </div>
      
                <div className="form-group location">
                  <label>
                    <i className="fas fa-map-marker-alt"></i> Vị Trí Hiện Tại
                  </label>
                  <div className="location-display">
                    {userLocation ? (
                      <span className="location-found">
                        <i className="fas fa-check-circle"></i> Đã xác định vị trí
                      </span>
                    ) : (
                      <span className="location-not-found">
                        <i className="fas fa-exclamation-circle"></i> Chưa có vị trí
                      </span>
                    )}
                    <button type="button" onClick={getUserLocation} className="refresh-location">
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                  {locationError && <span className="error-message">{locationError}</span>}
                </div>
      
                <div className="form-row">
                  <div className="form-group half">
                    <label>
                      <i className="fas fa-ruler"></i> Bán Kính (km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      {...register('radius', { required: true, min: 1, max: 50 })}
                      className={errors.radius ? 'error' : ''}
                    />
                    {errors.radius && <span className="error-message">Bán kính phải từ 1-50 km</span>}
                  </div>
      
                  <div className="form-group half">
                    <label>
                      <i className="fas fa-list-ol"></i> Số Lượng
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="3"
                      {...register('limit', { required: true, min: 1, max: 3 })}
                      className={errors.limit ? 'error' : ''}
                    />
                    {errors.limit && <span className="error-message">Số lượng phải từ 1-3</span>}
                  </div>
                </div>
      
                <button type="submit" className="submit-btn" disabled={loadingCinema}>
                  {loadingCinema ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>} Tìm Rạp Phim
                </button>
              </form>
            </div>
      )}


      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chọn Phim</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingFilm ? (
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Đang tải danh sách phim...</p>
                </div>
              ) : (
                <div className="film-grid">
                  {films.map((film) => (
                    <div key={film._id} className="film-card" onClick={() => selectFilm(film)}>
                      <div className="film-poster">
                        {film.image ? (
                          <img src={film.image} alt={film.title} />
                        ) : (
                          <div className="no-poster">
                            <i className="fas fa-film"></i>
                          </div>
                        )}
                      </div>
                      <div className="film-info">
                        <h3>{film.title}</h3>
                        {film.duration && <p>{film.duration} phút</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {searchResults && (
        <div className="results-container">
          <div className="results-header">
            <h2>Kết Quả Tìm Kiếm</h2>
          </div>

          {searchResults.error ? (
            <div className="no-results">
              <i className="fas fa-exclamation-circle"></i>
              <p>{searchResults.error}</p>
            </div>
          ) : (
            <>
              <p className="results-message">{searchResults.message}</p>
              <div className="cinema-grid">
                {searchResults.data && searchResults.data.map((cinema, index) => (
                  <div key={index} className="cinema-card">
                    <h3>{cinema.name}</h3>
                    <div className="cinema-details">
                      <p>
                        <i className="fas fa-map-marker-alt"></i> {cinema.address}
                      </p>
                      <p>
                        <i className="fas fa-route"></i> Khoảng cách: {cinema.distance} km
                      </p>
                      <p>
                        <i className="fas fa-clock"></i> Thời gian di chuyển: {cinema.duration} phút
                      </p>
                    </div>

                    {cinema.imgShowTime && (
                      <div className="showtime-image">
                        <h4>Lịch chiếu:</h4>
                        <div
                          className="showtime-image-container"
                          onClick={() => showEnlargedImage(cinema.imgShowTime, cinema.name)}
                        >
                          <img src={cinema.imgShowTime} alt="Lịch chiếu" />
                          <div className="zoom-overlay">
                            <i className="fas fa-search-plus"></i>
                            <span>Xem lịch và giá☝️</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <a href={`https://moveek.com/rap/${cinema.slug}/`} target="_blank" rel="noopener noreferrer" className="view-more">
                      Mua vé ngay <i className="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {enlargedImage && (
        <div className="image-modal" onClick={closeEnlargedImage}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>Lịch chiếu tại {enlargedImage.name}</h3>
              <button onClick={closeEnlargedImage} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="image-modal-body">
              <img src={enlargedImage.url} alt={`Lịch chiếu tại ${enlargedImage.name}`} />
            </div>
            <div className="image-modal-footer">
              <p>Ấn vào bất kỳ đâu để đóng</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;