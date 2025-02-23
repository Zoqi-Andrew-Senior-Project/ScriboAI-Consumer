import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';

const InviteButton = () =>{
    return(
        <button className="btn btn-secondary">+</button>
    )
}
const MemberTable = () => {
    const [members, setMembers] = useState([]);

    const [isMemberActionFormOpen, setIsMemberActionFormOpen] = useState(false);

    const handleShowForm = () => {
        setIsMemberActionFormOpen(true);
    }

    const handleCloseForm = () => {
        setIsMemberActionFormOpen(false);
    }

    useEffect(() => {
        axios
          .get(process.env.REACT_APP_BACKEND_ADDRESS + "/api/org/organization", {
            withCredentials: true,  // Ensures cookies are sent
          })
          .then((response) => setMembers(response.data.members))
          .catch((error) => console.error("Error fetching members:", error));
    }, []);
    

    return (
        <div>
            <h2>Member List</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => (
                        <tr key={member.user_name}>
                            <td>{member.user_name}</td>
                            <td>{member.first_name} {member.last_name}</td>
                            <td>{member.email}</td>
                            <td>{member.role}</td>
                            <td>{member.status}</td>
                            <td>
                                <button onClick={handleShowForm} className="btn btn-secondary">
                                    🛠️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <MemberActionForm isOpen={isMemberActionFormOpen} onClose={handleCloseForm} />
        </div>
    )
}

const MemberActionForm = ({isOpen, onClose}) => {
    const formRef = useRef(null);

    const handleClickOutside = (e) => {
        if (!formRef.current.contains(e.target)) {
            onClose();
        }
    }

    if (!isOpen) return null;
    return (
        <div className='overlay' onClick={handleClickOutside}>
            <div className='form-container' ref={formRef}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h1>Member Actions</h1>
                <div> 🔁 Change Role </div>
                <div> 🗑️ Remove </div>
            </div>
        </div>
    )
}

const InvitationsTable = () => {
    const [invites, setInvites] = useState([]);

    const [isInviteActionFormOpen, setIsInviteActionFormOpen] = useState(false);

    const handleShowForm = () => {
        setIsInviteActionFormOpen(true);
    }

    const handleCloseForm = () => {
        setIsInviteActionFormOpen(false);
    }

    useEffect(() => {
        axios
          .get(process.env.REACT_APP_BACKEND_ADDRESS + "/api/org/invite", {
            withCredentials: true,  // Ensures cookies are sent
          })
          .then((response) => setInvites(response.data.invites))
          .catch((error) => console.error("Error fetching members:", error));
    }, []);
    

    return (
        <div>
            <h2>Invite List</h2>
            <p className="text-muted"> Invite more employees to your organization. <InviteButton /></p> 
            <table className="table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Sent At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invites.map((invite) => (
                        <tr key={invite.email}>
                            <td>{invite.email}</td>
                            <td>{Date(invite.created_at).split(' ').slice(0,5).join(' ')}</td>
                            <td>
                                <button onClick={handleShowForm} className="btn btn-secondary">
                                    🛠️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <InviteActionForm isOpen={isInviteActionFormOpen} onClose={handleCloseForm} />
        </div>
    )
}


const InviteActionForm = ({isOpen, onClose}) => {
    const formRef = useRef(null);

    const handleClickOutside = (e) => {
        if (!formRef.current.contains(e.target)) {
            onClose();
        }
    }

    if (!isOpen) return null;
    return (
        <div className='overlay' onClick={handleClickOutside}>
            <div className='form-container' ref={formRef}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h1>Invite Actions</h1>
                <div> 🔁 Resend </div>
                <div> 🗑️ Delete </div>
            </div>
        </div>
    )
}

const EmployeeDashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please log in.</div>;

    if (user.role !== 'OW' && user.role !== 'AD') return <div>Permission denied.</div>;

    return (        
        <div className="container-fluid main-content">
            <h1>Employee Dashboard</h1>
            <div className='d-flex justify-content-between align-items-center mb-3'>
            </div>
            <div className='row'>
                <div className="col">
                    <MemberTable />
                </div>
                <div className='col'>
                    <InvitationsTable />
                </div>
            </div>
        </div>
    );
  }

  export default EmployeeDashboard;