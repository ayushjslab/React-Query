/* eslint-disable @next/next/no-img-element */
"use client";

import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const fetchUser = async (id: number) => {
  const { data } = await axios.get(`https://dummyjson.com/users/${id}`);
  return data;
};

export default function ParallelPage() {
  const [userIds] = useState([1, 2, 3, 4]);

  const userQueries = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => fetchUser(id),
      staleTime: 30000,
    })),
  });

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        👥 Parallel User Fetch
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {userQueries.map((query, index) => {
            console.log(index)
          if (query.isLoading)
            return (
              <div
                key={userIds[index]}
                className="p-4 bg-gray-700 animate-pulse rounded-lg text-center"
              >
                Loading user #{userIds[index]}...
              </div>
            );

          if (query.isError)
            return (
              <div
                key={index}
                className="p-4 bg-red-100 text-red-600 rounded-lg"
              >
                Error loading user #{userIds[index]}
              </div>
            );

          const user = query.data;

          return (
            <div
              key={user.id}
              className="p-5 border rounded-lg shadow bg-white hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.image}
                  alt={user.firstName}
                  className="w-16 h-16 rounded-full border"
                />
                <div>
                  <h2 className="text-xl font-semibold text-black">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="mt-3 text-gray-700 text-sm">
                <p>
                  <strong>Age:</strong> {user.age}
                </p>
                <p>
                  <strong>City:</strong> {user.address.city}
                </p>
                <p>
                  <strong>Company:</strong> {user.company.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
