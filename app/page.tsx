"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const fetchTodos = async (): Promise<Todo[]> => {
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/todos"
  );
  return data;
};

export default function Home() {
  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    // staleTime: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400 mr-3"></div>
        <span>Loading todos...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>Oops! Something went wrong 😢</p>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        ✅ Todos ({todos?.length})
      </h1>

      <ul className="space-y-3">
        {todos?.slice(0, 100).map((todo) => (
          <li
            key={todo.id}
            className={`p-4 border rounded-md shadow-sm flex items-center justify-between ${
              todo.completed ? "bg-green-50" : "bg-white"
            }`}
          >
            <span
              className={`${
                todo.completed ? "line-through text-gray-500" : "text-gray-800"
              }`}
            >
              {todo.title}
            </span>
            {todo.completed ? (
              <span className="text-green-600">✔</span>
            ) : (
              <span className="text-yellow-500">⏳</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
