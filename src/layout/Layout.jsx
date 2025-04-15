import "./Layout.css"

const Layout = ({ children }) => {
  return (
    <div className="background">
      <div className="container">
        {children}
      </div>
    </div>
  );
}

export default Layout;