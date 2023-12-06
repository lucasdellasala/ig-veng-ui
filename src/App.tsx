import React, { useState, ChangeEvent, useEffect } from 'react';
import './App.css';

interface User {
  id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
  followed_by_viewer: boolean;
  follows_viewer: boolean;
  requested_by_viewer: boolean;
  reel: Reel;
}

interface Reel {
  id: string;
  expiring_at: number;
  has_pride_media: boolean;
  latest_reel_media: number;
  seen: any; // Puedes ajustar el tipo según el contenido real
  owner: ReelOwner;
}

interface ReelOwner {
  __typename: string;
  id: string;
  profile_pic_url: string;
  username: string;
}

interface CardProps {
  user: User;
}

const defaultProfilePic = 'https://cdn4.iconfinder.com/data/icons/instagram-ui-twotone/48/Paul-18-512.png';
const verificationIcon = 'https://www.pngitem.com/pimgs/m/302-3024199_instagram-verified-symbol-png-instagram-verified-logo-png.png';

const Card: React.FC<CardProps> = ({ user }) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.target as HTMLImageElement;
    img.src = defaultProfilePic;
  };

  return (
    <div className="card" key={user.id}>
      <div className="profile-pic-container">
        <img
          className="profile-pic"
          src={user.profile_pic_url}
          alt={`${user.full_name}'s profile pic`}
          onError={handleImageError}
        />
      </div>
      <div className="user-info">
        <a target="_blank" href={`https://instagram.com/${user.username}`}  rel="noopener noreferrer"><h2>
          {user.full_name}{' '}
          {user.is_verified && (
            <img
              className="verification-icon"
              src={verificationIcon}
              alt="Verified"
              title="Verified"
            />
          )}
        </h2></a>
        <a target="_blank" href={`https://instagram.com/${user.username}`}  rel="noopener noreferrer"><p>@{user.username}</p></a>
        <p>{user.is_private ? 'Private' : 'Public'}</p>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 12;

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [fileLoaded, setFileLoaded] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('usersData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUsersData(parsedData);
        setFileLoaded(true);
      } catch (error) {
        console.error('Error parsing stored JSON:', error);
      }
    }
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target?.result as string);
          setUsersData(parsedData);
          localStorage.setItem('usersData', JSON.stringify(parsedData));
          setCurrentPage(1);
          setFileLoaded(true);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const totalPages = Math.ceil(usersData.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentUsers = usersData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      <h1>User Cards App</h1>
      {usersData.length > 0 ? (
        <>
          {fileLoaded ? (
            <>
              <div className="input">
                <p>¡Cargue un nuevo archivo JSON!</p>
                <input type="file" accept=".json" onChange={handleFileChange} />
              </div>
              <div className="card-container">
                {currentUsers.map((user) => (
                  <Card key={user.id} user={user} />
                ))}
              </div>
              <div className="pagination">
                {currentPage > 1 && (
                  <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)}>
                    Anterior
                  </button>
                )}
                <span className="page-info">{`Página ${currentPage} de ${totalPages}`}</span>
                {currentPage < totalPages && (
                  <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)}>
                    Siguiente
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>¡Cargue un nuevo archivo JSON!</p>
          )}
        </>
      ) : (
        <div>
          <p>¡Cargue un archivo JSON para comenzar!</p>
          <input type="file" accept=".json" onChange={handleFileChange} />
        </div>
      )}
    </div>
  );
};

export default App;
