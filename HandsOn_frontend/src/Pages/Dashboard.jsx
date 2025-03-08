const Dashboard = ({setAuth}) => {

    const logout = async e => {
        e.preventDefault();
        try {
          localStorage.removeItem("token");
          setAuth(false);
        } catch (err) {
          console.error(err.message);
        }
      };

    return (
        <div>
      <h1 className="mt-5">Dashboard</h1>
      <button onClick={e => logout(e)} className="btn btn-primary">
        Logout
      </button>
    </div>
    )
}   

export default Dashboard;
