import { useEffect, useState } from "react";
import * as React from 'react';
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator, Flex, TextAreaField, Loader, Text, View, Button } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { useAIGeneration } from "./client";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  const { user, signOut } = useAuthenticator();

  const [description, setDescription] = React.useState("");
  const [{ data, isLoading }, generateRecipe] =
    useAIGeneration("generateRecipe");

  const handleClick = async () => {
    generateRecipe({ description });
  };

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (<li 
          onClick={() => deleteTodo(todo.id)}
          key={todo.id}>
          {todo.content}
        </li>))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <Flex direction="column">
      <Flex direction="row">
        <TextAreaField
          autoResize
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          label="Description"
        />
        <Button onClick={handleClick}>Generate story</Button>
      </Flex>
      {isLoading ? (
        <Loader variation="linear" />
      ) : (
        <>
          <Text fontWeight="bold">{data?.name}</Text>
          <View as="ul">
            {data?.ingredients?.map((ingredient) => (
              <View as="li" key={ingredient}>
                {ingredient}
              </View>
            ))}
          </View>
          <Text>{data?.instructions}</Text>
        </>
      )}
    </Flex>
    <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
