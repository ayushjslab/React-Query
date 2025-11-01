"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";

type TypeTodo = {
  id: number;
  title: string;
  completed: boolean;
};

const fetchTodo = async (id: number): Promise<TypeTodo> => {
  console.log("🔥 API Fetch:", id);
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/todos/${id}`
  );
  return data;
};

const Todo = () => {
  const params = useParams();
  const id = Number(params.Id);

  const { data, isLoading, isError } = useQuery<TypeTodo>({
    queryKey: ["todo", id],
    queryFn: () => fetchTodo(id),
    staleTime: 1000 * 60 * 5, 
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mr-3"></div>
        Loading Todo...
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-500 mt-10">
        ⚠ Failed to load Todo
      </div>
    );

  return (
    <main className="max-w-xl mx-auto p-6 mt-10">
      <div className="bg-white shadow-md rounded-xl p-6 border">
        <h2 className="text-2xl font-bold text-blue-600 mb-3">
          📝 Todo #{data?.id}
        </h2>

        <p
          className={`text-lg mb-4 ${
            data?.completed ? "line-through text-gray-500" : "text-gray-800"
          }`}
        >
          {data?.title}
        </p>

        <span
          className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
            data?.completed
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {data?.completed ? "✔ Completed" : "⏳ Pending"}
        </span>
      </div>
    </main>
  );
};

export default Todo;
