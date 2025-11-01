/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";

type TypeTodo = {
  id: number;
  title: string;
  completed: boolean;
};

const fetchTodo = async (id: number): Promise<TypeTodo> => {
  console.log("🔥 API FETCH:", id);
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/todos/${id}`
  );
  return data;
};

const Todo = () => {
  const queryClient = useQueryClient();
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

  const mutation = useMutation({
    mutationFn: (updated: Partial<TypeTodo>) =>
      axios.put(`https://jsonplaceholder.typicode.com/todos/${id}`, updated),

    // ✅ Optimistic Update
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: ["todo", id] });

      const previous = queryClient.getQueryData(["todo", id]);

      queryClient.setQueryData(["todo", id], (old: any) => ({
        ...old,
        ...updatedTodo,
      }));

      return { previous };
    },

    // ✅ Rollback if failed
    onError: (_err, _new, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todo", id], context.previous);
      }
    },

    // ✅ Sync with server result
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo", id] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return (
    <main className="max-w-xl mx-auto p-6">
      <div className="p-6 border rounded-xl bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">Todo #{data?.id}</h1>

        <p className="my-4 text-gray-800">{data?.title}</p>

        <button
          className={`px-4 py-2 rounded-lg font-semibold text-white ${
            data?.completed ? "bg-red-500" : "bg-green-600"
          }`}
          onClick={() =>
            mutation.mutate({
              completed: !data?.completed,
            })
          }
        >
          {data?.completed ? "Mark as Pending" : "Mark as Completed"}
        </button>
      </div>
    </main>
  );
};

export default Todo;
