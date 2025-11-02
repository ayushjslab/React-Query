/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce"

type Post = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  userId: number;
};

const fetchPosts = async (
  limit: number,
  skip: number,
  q: string
): Promise<Post[]> => {
  const { data } = await axios.get(
    `https://dummyjson.com/posts/search?limit=${limit}&skip=${skip}&q=${q}`
  );
  return data.posts;
};

export default function PaginatedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const limit = Number(searchParams.get("limit")) || 4;
  const skip = Number(searchParams.get("skip")) || 0;
  const q = searchParams.get("q") || "";

  const [searchText, setSearchText] = useState(q);

  const updateParams = (paramsObj: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(paramsObj).forEach(([key, val]) =>
      params.set(key, String(val))
    );
    router.replace(`?${params.toString()}`);
  };
  const { data: posts } = useQuery({
    queryKey: ["posts", limit, skip, q],
    queryFn: () => fetchPosts(limit, skip, q),
    placeholderData: keepPreviousData,
  });

    const debouncedSearch = useMemo(
      () =>
        debounce((value: string) => {
          updateParams({ q: value, skip: 0 });
        }, 1000),
      []
    );

    const handleMove = (moveCount: number) => {
      const newSkip = Math.max(skip + moveCount, 0);
      updateParams({ skip: newSkip });
    };

useEffect(() => {
  debouncedSearch(searchText);
  return () => debouncedSearch.cancel();
}, [searchText]);


  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        📝 Posts ({posts?.length})
      </h1>

      <div className="flex items-center max-w-md mx-auto my-5">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none"
        />
      </div>
      <ul className="space-y-4">
        {posts?.map((post) => (
          <li
            key={post.id}
            className="p-4 border rounded-md shadow-md bg-white"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {post.title}
            </h2>
            <p className="text-gray-600 mt-1">{post.body}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>👀 Views: {post.views}</span>
              <span>
                👍 {post.reactions.likes} | 👎 {post.reactions.dislikes}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 justify-center mt-5">
        <button
          onClick={() => handleMove(-limit)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none"
        >
          Previous
        </button>

        <button
          onClick={() => handleMove(limit)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        >
          Next
        </button>
      </div>
    </main>
  );
}
