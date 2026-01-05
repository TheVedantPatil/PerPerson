function Header({ onLogout }) {
  return (
    <header className="header">
      <div className="container nav">
        <div className="logo">PerPerson</div>
        {onLogout && (
          <button className="btn btn-danger" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;