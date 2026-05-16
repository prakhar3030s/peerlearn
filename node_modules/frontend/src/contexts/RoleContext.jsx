import { createContext, useContext, useEffect, useState } from "react";

const RoleContext = createContext(null);

const ROLE_KEY = "peerlearn-dev-role";

const ROLES = {
  student: {
    id: "student",
    label: "Student",
    user: {
      id: "student-riya",
      name: "Riya Sharma",
      email: "riya.sharma@peerlearn.edu",
      role: "student",
      year: "2nd",
      branch: "CSE",
    },
  },
  moderator: {
    id: "moderator",
    label: "Moderator",
    user: {
      id: "moderator-sharma",
      name: "Dr. Sharma",
      email: "dr.sharma@peerlearn.edu",
      role: "moderator",
      branch: "CSE",
    },
  },
  admin: {
    id: "admin",
    label: "Admin",
    user: {
      id: "admin-root",
      name: "Admin",
      email: "admin@peerlearn.edu",
      role: "admin",
    },
  },
};

export function RoleProvider({ children }) {
  const [roleId, setRoleId] = useState(() => {
    if (typeof window === "undefined") return "student";
    const stored = window.localStorage.getItem(ROLE_KEY);
    return stored && ROLES[stored] ? stored : "student";
  });

  useEffect(() => {
    window.localStorage.setItem(ROLE_KEY, roleId);
  }, [roleId]);

  const value = {
    role: roleId,
    setRole: setRoleId,
    currentUser: ROLES[roleId].user,
    roles: Object.values(ROLES),
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}

