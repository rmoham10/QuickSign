import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <>
      <header className="header">
        <div className="box">
          <div className="logo">
            <h1>BeFit</h1>
          </div>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/signin">Sign In</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
      </header>

      {/* Inline CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap');

        * {
          margin: 0;
          padding: 0;
        }

        body {
          font-family: "Noto Serif", serif;
          color: rgb(173, 50, 50);
        }

        .header {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 22vh;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: white;
          background-image: url('/gymequip.jpeg');
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          border-bottom: 1px solid rgb(87, 5, 5);
          z-index: 1000;
        }

        .box {
          width: 17vh;
          height: 15vh;
          margin-top: 7vh;
          background-color: rgb(231, 10, 10);
          padding: 10px;
          display: flex;
          align-items: flex-end;
        }

        .logo {
          display: flex;
          flex-direction: column;
          gap: 0rem;
        }

        .logo h1,
        .text_x1 {
          color: white;
          margin: 0;
        }

        nav,
        .nav-links {
          display: flex;
        }

        .nav-links {
          margin-left: 850px;
          gap: 2rem;
          list-style: none;
          font-size: 1.5rem;
        }

        a {
          color: white;
          text-decoration: none;
        }

        a:hover {
          color: rgb(173, 166, 166);
        }
      `}</style>
    </>
  );
};

export default Header;