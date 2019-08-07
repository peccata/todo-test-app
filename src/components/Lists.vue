<template>
  <div class="todo-lists">
    <h1>Todo Lists</h1>
    <form @submit.prevent="addList(name)" class="add-list-form my-2 mx-auto">
      <b-form-input required v-model="name" placeholder="List Name" class="d-inline-block"></b-form-input>
      <b-button variant="primary" type="submit">Add New List</b-button>
    </form>
    <b-card-group columns>
      <b-card no-body v-for="(list, idx) in lists" :key="idx" sm="3" class="my-2">
        <b-link :to="{ name: 'List', params: { id: list.id }}">
          <h2 class="my-2">{{ list.name }}</h2>
        </b-link>
        <b-list-group flush>
          <b-list-group-item
            v-if="Object.keys(list.todos).length"
            v-for="todo in sortTodos(list.todos)"
            :key="todo[0]" :class="todo[1].checked ? 'checked' : ''"
          >
            {{ todo[1].description }}
          </b-list-group-item>
        </b-list-group>
        <div class="my-2">
          <b-link :to="{ name: 'List', params: { id: list.id }}">
            <b-button variant="primary">Edit</b-button>
          </b-link>
          <b-button variant="danger" @click="deleteList(list.id)">Delete</b-button>
        </div>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
import { db } from '../main'
import List from '@/components/List'
export default {
  name: 'Lists',
  data () {
    return {
      lists: {
        todos: {}
      },
      name: ''
    }
  },
  firestore () {
    return {
      lists: db.collection('lists').orderBy('createdAt', 'desc')
    }
  },
  components: {
    List
  },
  methods: {
    addList (name) {
      const createdAt = new Date()
      const updatedAt = new Date()
      const todos = {}
      db.collection('lists').add({ name, createdAt, updatedAt, todos })
    },
    deleteList (id) {
      db.collection('lists').doc(id).delete()
    },
    sortTodos: function (todos) {
      var todosArray = []
      for (var i in todos) {
        todosArray.push([i, todos[i]])
      }

      function compare (a, b) {
        return new Date(a[1].createdAt.seconds * 1000) - new Date(b[1].createdAt.seconds * 1000)
      }

      return todosArray.sort(compare)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.add-list-form {
  max-width: 400px;
}
.add-list-form input {
  width: auto;
}
.list-group-item.checked {
  text-decoration: line-through;
}
</style>
