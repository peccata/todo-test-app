<template>
  <div class="list mx-auto">
    <div>
      <h2>{{ listData.name }}</h2>
      <b-alert v-model="showSuccessMessage" variant="success">List saved successfully</b-alert>
      <b-list-group class="my-2">
        <b-list-group-item v-if="Object.keys(listData.todos).length"
          class="d-flex justify-content-between align-items-center"
          v-for="task in sortedTodos"
          :key="task[0]"
        >
          <b-form-checkbox
            :checked="task[1].checked"
            :id="'checkbox-' + task[0]"
            :name="'checkbox-' + task[0]"
            @change="check($event, task[0])"
          >
            <span :class="task[1].checked ? 'checked' : ''">{{ task[1].description }}</span>
          </b-form-checkbox>
          <b-button variant="danger" @click="deleteTask(task[0])">&times;</b-button>
        </b-list-group-item>
      </b-list-group>
      <form @submit.prevent="addTask(newTaskDescription)">
        <b-input-group class="my-3 w-50 mx-auto">
          <b-form-input required v-model="newTaskDescription" placeholder="Task description..."></b-form-input>
          <b-input-group-append>
            <b-button variant="primary" type="submit">+</b-button>
          </b-input-group-append>
        </b-input-group>
      </form>
      <b-button variant="primary" @click="saveList">Save</b-button>
    </div>
    <b-modal
      title="Simultaneous Update"
      id="saveModal"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-title="Save local version"
      cancel-title="Load server version"
    >
      List was updated by another user. Do you want to save your version anyway?
    </b-modal>
  </div>
</template>

<script>
import { db } from '../main'
export default {
  name: 'List',
  props: ['id'],
  data () {
    return {
      listData: {
        name: '',
        todos: {}
      },
      newTaskDescription: '',
      updated: false,
      showSuccessMessage: false
    }
  },
  computed: {
    sortedTodos: function () {
      if (!Object.keys(this.listData['todos']).length) return {}

      var todosArray = []
      for (var i in this.listData['todos']) {
        todosArray.push([i, this.listData['todos'][i]])
      }

      function compare (a, b) {
        return new Date(a[1].createdAt.seconds * 1000) - new Date(b[1].createdAt.seconds * 1000)
      }

      return todosArray.sort(compare)
    }
  },
  methods: {
    addTask: function (description) {
      const createdAt = new Date()
      const updatedAt = new Date()
      const checked = false

      var newId = db.collection('lists').doc().id
      this.$set(this.listData['todos'], newId, {
        description: description,
        checked: checked,
        createdAt: createdAt,
        updatedAt: updatedAt
      })
      this.newTaskDescription = ''
      this.showSuccessMessage = false
    },
    deleteTask: function (taskId) {
      this.$delete(this.listData['todos'], taskId)
      this.showSuccessMessage = false
    },
    saveList: function () {
      let ref = db.collection('lists').doc(this.id)

      if (this.updated === true) {
        this.$bvModal.show('saveModal')
      } else {
        ref.set(this.listData).then(function () {
          this.showSuccessMessage = true
        }.bind(this))
      }
    },
    handleOk: function () {
      db.collection('lists').doc(this.id).set(this.listData)
      this.showSuccessMessage = true
    },
    handleCancel: function () {
      db.collection('lists').doc(this.id).get().then(function (doc) {
        this.listData = doc.data()
      }.bind(this))
    },
    check: function (e, taskId) {
      this.listData['todos'][taskId].checked = e
      this.showSuccessMessage = false
    }
  },
  created: function () {
    db.collection('lists').doc(this.id).onSnapshot(function (doc) {
      if (!this.listData.createdAt) {
        this.listData = doc.data()
        return
      }
      var source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
      if (source === 'Server') {
        this.updated = true
      }
    }.bind(this))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list {
  max-width: 600px;
}
.list-group-item .checked {
  text-decoration: line-through;
}
</style>
