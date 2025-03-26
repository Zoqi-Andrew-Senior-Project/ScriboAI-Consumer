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
            <h2 className="text-2xl font-semibold mb-4">Member List</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                <table className="table-auto w-full text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2">Username</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.user_name} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{member.user_name}</td>
                                <td className="px-4 py-2">{member.first_name} {member.last_name}</td>
                                <td className="px-4 py-2">{member.email}</td>
                                <td className="px-4 py-2">{member.role}</td>
                                <td className="px-4 py-2">{member.status}</td>
                                <td className="px-4 py-2">
                                    <button onClick={() => handleShowForm(member)} className="btn btn-secondary">
                                        🛠️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
        <div 
            className={`fixed inset-0 flex justify-center items-center z-50 ${isOpen ? 'block' : 'hidden'}`}
            onClick={handleClickOutside}
        >
            <div
                className='bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative'
                ref={formRef}
            >
                <button
                    className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-gray-900"
                    onClick={onClose}
                >
                    &times;
                </button>

                <h1 className="text-2xl font-semibold mb-4">Member Actions</h1>
                <p className="mb-4">User: {member.user_name}</p>
                <div className="mb-4">
                    <button
                        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                        onClick={openRoleForm}
                    >
                        🔁 Change Role
                    </button>
                </div>
                <div className="mb-4">
                    <button
                        className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                        onClick={openDeleteForm}
                    >
                        🗑️ Remove
                    </button>
                </div>
                {isRoleFormOpen && (
                    <div className="mt-4">
                        <h2 className="text-xl font-semibold mb-4">Change Role</h2>
                        {(member.role !== 'AD'  && member.role !== 'OW' && user?.role === 'OW') && (
                            <button
                                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 mb-2"
                                onClick={() => handleRoleChange(UserRole.ADMIN)}
                            >
                                TO ADMIN
                            </button>
                        )}
                        {(member.role !== 'EM' && member.role !== 'OW' && user?.role === 'OW') && (
                            <button
                                className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 mb-2"
                                onClick={() => handleRoleChange(UserRole.EMPLOYEE)}
                            >
                                TO EMPLOYEE
                            </button>                        )}
                        {member.role === 'OW' && (
                            <p className="text-gray-500">No Actions Available.</p>
                        )}
                        <button
                            className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 mt-4"
                            onClick={closeRoleForm}
                        >
                            Cancel
                        </button>
                    </div>
                )}
                {isDeleteFormOpen && (
                    <div className=''>
                        <h2>Remove Member</h2>
                        <p>Are you sure you want to remove {member.user_name} from the organization?</p>
                        <button className='' onClick={closeDeleteForm}>Cancel</button>
                        <button className='' onClick={handleDelete}>Remove</button>
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
        <div className="p-6 bg-white rounded-lg shadow-md">
            <p className="text-lg font-semibold mb-4">
                Invite more employees to your organization.
                <button
                    className="ml-2 py-1 px-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200"
                    onClick={handleShowCreateForm}
                >
                    +
                </button>
            </p>

            <div className="overflow-auto max-h-80">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Email</th>
                        <th className="py-2 px-4 text-left">Sent At</th>
                        <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {invites.map((invite) => (
                            <tr key={invite.email} className="border-t">
                                <td className="py-2 px-4">{invite.email}</td>
                                <td className="py-2 px-4">{invite.created_at}</td>
                                <td className="py-2 px-4">
                                    <button
                                        onClick={() => handleShowForm(invite)}
                                        className="text-yellow-600 hover:text-yellow-800"
                                    >
                                        🛠️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
        <div className="fixed inset-0  flex items-center justify-center z-50" onClick={handleClickOutside}>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" ref={formRef}>
                <button
                    className="absolute top-4 right-4 text-gray-600 text-2xl"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h1 className="text-2xl font-semibold mb-4 text-center">Invite Actions</h1>
                <p className="text-center text-gray-700 mb-6">Invite to: {invite.email}</p>

                <div className="space-y-4">
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={handleResend}
                    >
                        🔁 Resend
                    </button>
                    <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={handleDelete}
                    >
                        🗑️ Delete
                    </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClickOutside}>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" ref={formRef}>
                <button className="absolute top-4 right-4 text-gray-600 text-2xl" onClick={onClose}>
                    &times;
                </button>
                <h1 className="text-2xl font-semibold mb-4 text-center">Invite Employee</h1>
                <p className="text-center text-gray-700 mb-6">Enter the email of the employee you would like to invite.</p>
                <form id="emailForm" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                            title="Please enter a valid email address."
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="submit"
                    >
                        Submit
                    </button>
                    {errorMessage && (
                        <div id="error" className="text-sm text-red-600 mt-2">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

const EmployeeDashboard = () => {
    const { user, loading } = useAuth();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please log in.</div>;

    if (user.role !== 'OW' && user.role !== 'AD') return <div>Permission denied.</div>;

    const toggleInviteModal = () => {
        setIsInviteModalOpen(!isInviteModalOpen);
    }

    return (        
        <div className="justify-center min-h-screen text-center">
            <h1 className="text-3xl font-semibold mb-6">Employee Dashboard</h1>
            <button 
                    onClick={toggleInviteModal} 
                    className="mb-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                >
                    Manage Invitations
                </button>

            <div className= "p-6">
                <MemberTable />
            </div>
            
            {/* Modal for Invitations Table */}
            {isInviteModalOpen && (
                    <div
                        className="fixed inset-0 flex justify-center items-center z-50"
                        onClick={toggleInviteModal} // Clicking outside the modal closes it
                    >
                        <div
                            className="bg-white rounded-lg shadow-lg p-6 w-3/4 md:w-2/3 xl:w-1/2"
                            onClick={(e) => e.stopPropagation()} // Prevent the modal from closing when clicking inside
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold">Invite List</h2>
                                <button
                                    onClick={toggleInviteModal}
                                    className="text-lg font-bold text-gray-600"
                                >
                                    &times;
                                </button>
                            </div>
                            <InvitationsTable />
                        </div>
                    </div>
                )}
        </div>
    );
  }

  export default EmployeeDashboard;