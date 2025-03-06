import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <div className="navbar bg-base-100 shadow-sm bg-blue-50">
      <div className="navbar-start">
        
      </div>
      <div className="navbar-center">
      <img
          className="mx-auto h-15 w-auto"
          src="https://yt3.googleusercontent.com/SQgA6Ar0GVaooh7Bgr41UhNNDJ9N8pWchLEGouRHQDx2w5ZxFE3P_oaZz6xEJaxpoI3MeKysrg=s900-c-k-c0x00ffffff-no-rj"
          alt="Workflow"
        />
        <Link to="/" className="text-3xl font-bold text-blue-800">HandsOn</Link>
      </div>
      <div className="navbar-end">
        
      </div>
    </div>
  );
}
