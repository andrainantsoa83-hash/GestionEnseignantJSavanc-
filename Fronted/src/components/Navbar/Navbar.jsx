import { MdMenu, MdNotifications, MdAccountCircle } from 'react-icons/md';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <MdMenu size={24} />
        </button>
      </div>
      <div className="navbar-right">
        <button className="icon-btn">
          <MdNotifications size={24} />
        </button>
        <div className="user-profile">
          <MdAccountCircle size={28} />
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
