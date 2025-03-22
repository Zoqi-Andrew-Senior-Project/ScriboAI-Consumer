import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';

interface Member {
    "first_name": string,
    "last_name": string,
    "email": string,
    "role": string,
    "organization": string,
    "status": string,
    "user_name": string
}

const MemberTable = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isMemberActionFormOpen, setIsMemberActionFormOpen] = useState(false);

    const handleShowForm = (member: Member) => {
        setSelectedMember(member);
        setIsMemberActionFormOpen(true);
    }

    const handleCloseForm = () => {
        setIsMemberActionFormOpen(false);
        setSelectedMember(null);
    }

    useEffect(() => {
        axios
          .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/organization`, {
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
                                <button onClick={() => handleShowForm(member)} className="btn btn-secondary">
                                    🛠️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <MemberActionForm isOpen={isMemberActionFormOpen} onClose={handleCloseForm} member={selectedMember}/>
        </div>
    )
}

interface MemberActionFormProps {
    isOpen: boolean;
    onClose: () => void;
    member: Member | null;
}

enum UserRole {
    ADMIN = "AD",
    OWNER = "OW",
    EMPLOYEE = "EM"
}

const MemberActionForm: React.FC<MemberActionFormProps> = ({isOpen, onClose, member}) => {
    const formRef = useRef<HTMLDivElement>(null);
    const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.EMPLOYEE);
    const { user, loading } = useAuth();

    if (!isOpen || !member) return null;  

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (formRef.current && !formRef.current.contains(e.target as Node)) {
            onClose();
            setIsRoleFormOpen(false);
            setIsDeleteFormOpen(false);
        }
    }

    const handleDelete = () => {
        axios
          .delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/member`, {
            withCredentials: true,  // Ensures cookies are sent
            data: {
                member_username: member.user_name
            }
          })
          .then((response) => {
              console.log(response.data);
              onClose();
              setIsRoleFormOpen(false);
              setIsDeleteFormOpen(false);
          })
          .catch((error) => console.error("Error deleting member:", error));
    }

    const handleClose = () => {
        onClose();
        setIsRoleFormOpen(false);
        setIsDeleteFormOpen(false);
    }

    const handleRoleChange = (newRole: UserRole) => {
        if (!member) return;
        if (newRole !== member.role) {
            setSelectedRole(newRole);

            axios.put(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/member/`, {
                member_username: member.user_name,
                role: newRole
            }, {
                withCredentials: true,  // Ensures cookies are sent
            })
            .then((response) => {
                console.log(response.data);
                onClose();
                setIsRoleFormOpen(false);
                setIsDeleteFormOpen(false);
            })
        } else {
            console.log("Role has not changed");
        }
    }

    const openRoleForm = () => {
        setIsRoleFormOpen(true);
    }

    const closeRoleForm = () => {
        setIsRoleFormOpen(false);
    }

    const openDeleteForm = () => {
        setIsDeleteFormOpen(true);
    }

    const closeDeleteForm = () => {
        setIsDeleteFormOpen(false);
    }

    if (!isOpen || !member) return null;

    return (
        <div className='overlay' onClick={handleClickOutside}>
            <div className='form-container' ref={formRef}>
                <button className="close-button" onClick={handleClose}>&times;</button>
                <h1>Member Actions</h1>
                <p>{member.user_name}</p>
                <div>
                    <button className='btn btn-tertiary' onClick={openRoleForm}> 🔁 Change Role </button>
                </div>
                <div>
                    <button className='btn btn-tertiary' onClick={openDeleteForm}> 🗑️ Remove </button>
                </div>
                {isRoleFormOpen && (
                    <div className='form-container'>
                        <h2>Change Role</h2>
                        {(member.role !== 'AD'  && member.role !== 'OW' && user?.role === 'OW') && (
                            <button className='btn btn-tertiary' onClick={() => handleRoleChange(UserRole.ADMIN)}>TO ADMIN</button>
                        )}
                        {(member.role !== 'EM' && member.role !== 'OW' && user?.role === 'OW') && (
                            <button className='btn btn-tertiary' onClick={() => handleRoleChange(UserRole.EMPLOYEE)}>TO EMPLOYEE</button>
                        )}
                        {member.role === 'OW' && (
                            <p>No Actions Available.</p>
                        )}
                        <button className='btn btn-tertiary' onClick={closeRoleForm}>Cancel</button>
                    </div>
                )}
                {isDeleteFormOpen && (
                    <div className='form-container'>
                        <h2>Remove Member</h2>
                        <p>Are you sure you want to remove {member.user_name} from the organization?</p>
                        <button className='btn btn-tertiary' onClick={closeDeleteForm}>Cancel</button>
                        <button className='btn btn-tertiary' onClick={handleDelete}>Remove</button>
                    </div>
                )}
            </div>
        </div>
    )
}

interface Invite {
    email: string;
    organization: string;
    created_at: string;
}

const InvitationsTable = () => {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);

    const [isInviteActionFormOpen, setIsInviteActionFormOpen] = useState(false);
    const [isCreateInviteFormOpen, setIsCreateInviteFormOpen] = useState(false);

    const handleShowForm = (invite: Invite) => {
        setSelectedInvite(invite);
        setIsInviteActionFormOpen(true);
    }

    const handleCloseForm = () => {
        setIsInviteActionFormOpen(false);
        setSelectedInvite(null);
    }

    const handleShowCreateForm = () => {
        setIsCreateInviteFormOpen(true);
    }

    const handleCloseCreateForm = () => {
        setIsCreateInviteFormOpen(false);
    }

    useEffect(() => {
        axios
          .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/invite/`, {
            withCredentials: true,  // Ensures cookies are sent
          })
          .then((response) => setInvites(response.data.invites))
          .catch((error) => console.error("Error fetching members:", error));
    }, []);
    

    return (
        <div>
            <h2>Invite List</h2>
            <p className="text-muted"> Invite more employees to your organization.<button className="btn btn-secondary" onClick={handleShowCreateForm}>+</button></p> 
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
                            <td>{invite.created_at}</td>
                            <td>
                                <button onClick={() => handleShowForm(invite)} className="btn btn-secondary">
                                    🛠️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <InviteActionForm isOpen={isInviteActionFormOpen} onClose={handleCloseForm} invite={selectedInvite} />
            <CreateInviteForm isOpen={isCreateInviteFormOpen} onClose={handleCloseCreateForm} />
        </div>
    )
}

interface InviteActionFormProps {
    isOpen: boolean;
    onClose: () => void;
    invite: Invite | null;
}

const InviteActionForm: React.FC<InviteActionFormProps> = ({ isOpen, onClose, invite }) => {
    const formRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (formRef.current && !formRef.current.contains(e.target as Node)) {
            onClose();
        }
    }

    const handleDelete = () => {
        if (!invite || !invite.email) {
            console.error("No invite selected for deletion.");
            return;
        }
        
        axios.delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/invite/`, {
            withCredentials: true,  // Ensures cookies are sent
            data: {
                email: invite.email
            }
          })
        .then((response) => {
            alert('Deleted invite to ' + invite.email);
            onClose();
        })
        .catch((error) => {
            console.error("Error deleting invite:", error);
            alert('Error deleting invite to ' + invite.email);
        });
    }

    const handleResend = () => {
        if (!invite || !invite.email) {
            console.error("No invite selected for resend.");
            return;
        }
        axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/invite/`, {
            email: invite.email
        }, {
            withCredentials: true
        })
        .then((response) => {
            alert('Invite sent to ' + invite.email);
            onClose();
        })
        .catch((error) => {
            console.error("Error sending invite:", error);
            alert('Error sending invite to ' + invite.email);
        });
    }

    if (!isOpen || !invite) return null;
    return (
        <div className='overlay' onClick={handleClickOutside}>
            <div className='form-container' ref={formRef}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h1>Invite Actions</h1>
                <p>Invite to: {invite.email}</p>
                <div>
                    <button className='btn btn-tertiary' onClick={handleResend}> 🔁 Resend </button>
                </div>
                <div>
                    <button className='btn btn-tertiary' onClick={handleDelete}> 🗑️ Delete </button>
                </div>
            </div>
        </div>
    )
}

interface CreateInviteFormProps {
    isOpen: boolean;
    onClose: () => void;
}
const CreateInviteForm: React.FC<CreateInviteFormProps> = ({ isOpen, onClose }) => {
    const formRef = useRef<HTMLDivElement>(null);

    const [email, setEmail] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        if(emailRegex.test(newEmail)) {
            setIsValid(true);
            setErrorMessage('');
        } else {
            setIsValid(false);
            setErrorMessage('Please enter a valid email address.');
        }
    };

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (formRef.current && !formRef.current.contains(e.target as Node)) {
            onClose();
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValid) {
            setErrorMessage('Please enter a valid email address.');
        } else {
            setErrorMessage('');
            axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/invite/`, {
                email: email
            }, {
                withCredentials: true
            })
            .then((response) => {
                alert('Invite sent to ' + email);
                onClose();
            })
            .catch((error) => {
                console.error("Error sending invite:", error);
                alert('Error sending invite to ' + email);
            });
        }
    };


    if (!isOpen) return null;
    return (
        <div className='overlay' onClick={handleClickOutside}>
            <div className='form-container' ref={formRef}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h1>Invite Employee</h1>
                <p>Enter the email of the employee you would like to invite.</p>
                <form id="emailForm" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        title="Please enter a valid email address."
                    />
                    <button className='btn btn-secondary' type="submit">Submit</button>
                    <div id="error" className="error">{errorMessage}</div>
                </form>
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