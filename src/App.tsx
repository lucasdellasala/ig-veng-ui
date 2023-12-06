// Importa las librerías necesarias
import React, { useState, ChangeEvent, useEffect } from 'react';
import './App.css';
import verificationIcon from './assets/verified.png'

// Interfaces de usuario y componentes relacionados
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

// URLs para imágenes por defecto
const defaultProfilePic = 'https://cdn4.iconfinder.com/data/icons/instagram-ui-twotone/48/Paul-18-512.png';

// Componente de tarjeta de usuario
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
        <a target="_blank" href={`https://instagram.com/${user.username}`} rel="noopener noreferrer">
          <h2>
            {user.full_name}{' '}
            {user.is_verified && (
              <img
                className="verification-icon"
                src={verificationIcon}
                alt="Verified"
                title="Verified"
              />
            )}
          </h2>
        </a>
        <a target="_blank" href={`https://instagram.com/${user.username}`} rel="noopener noreferrer">
          <p>@{user.username}</p>
        </a>
        <p>{user.is_private ? 'Privado' : 'Público'}</p>
      </div>
    </div>
  );
};

// Número de elementos por página
const ITEMS_PER_PAGE = 12;

// Componente principal de la aplicación
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [showVerified, setShowVerified] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  // Efecto para cargar datos almacenados localmente
  useEffect(() => {
    const storedData = localStorage.getItem('usersData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUsersData(parsedData);
        setFileLoaded(true);
        setTotalUsers(parsedData.length)
      } catch (error) {
        console.error('Error parsing stored JSON:', error);
      }
    }
  }, []);

  // Manejar cambio de archivo
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
          setTotalUsers(parsedData.length)
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Calcular el número total de páginas
  const totalPages = Math.ceil(
    (showVerified
      ? usersData.length
      : usersData.filter((user) => !user.is_verified).length) / ITEMS_PER_PAGE
  );

  // Calcular índices de inicio y fin según la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Filtrar usuarios según el estado de mostrar verificados
  const currentUsers = usersData
    .filter((user) => (showVerified ? true : !user.is_verified))
    .slice(startIndex, endIndex);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Manejar cambio de estado para mostrar verificados
  const handleToggleVerified = () => {
    setShowVerified(!showVerified);
    setCurrentPage(1); // Reiniciar la página al cambiar la opción de mostrar verificados
    const users =  !showVerified ? usersData.length : usersData.filter((user) => !user.is_verified).length;
    setTotalUsers(users)
  };

  return (
    <div className="App">
      <h1>IgVendettapp</h1>
      {usersData.length > 0 ? (
        <>
          {fileLoaded ? (
            <>
              <div className="input">
                <p>¡Cargue un nuevo archivo JSON!</p>
                <input type="file" accept=".json" onChange={handleFileChange} />
              </div>
              <button
                className={`toggle-verified ${showVerified ? 'active' : ''}`}
                onClick={handleToggleVerified}
              >
                Mostrar verificados: {showVerified ? 'Sí' : 'No'}
              </button>
              <div className="card-container">
                {currentUsers.map((user) => (
                  <Card key={user.id} user={user} />
                ))}
              </div>
              <div className="pagination">
                {currentPage > 1 && (
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Anterior
                  </button>
                )}
                <span className="page-info">{`Página ${currentPage} de ${totalPages} (${totalUsers} usuarios)`}</span>
                {currentPage < totalPages && (
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
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
