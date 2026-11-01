'use client'

import { getUsers } from "@/api/requests/users"
import { useQuery } from "@tanstack/react-query";

const   UsersPage = () => {
  const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers(''),
    });
    console.log(data)
  return (
    <div>
        
    </div>
  )
}

export default UsersPage