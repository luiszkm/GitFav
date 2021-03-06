import { GithubUser } from "./Github.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
    this.filter()

  }
  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites')) || []
    if (this.entries.length > 0) {
      this.addContainer()
    }

  }
  save() {
    localStorage.setItem('@github-favorites', JSON.stringify(this.entries))
    if (this.entries.length == 0) {
      this.removeContainer()
    }
  }
  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username
      )
      if (userExists) {//checagem de usario
        throw new Error('Usuário já favoritado')
      }
      const user = await GithubUser.search(username)
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }
      this.entries = [user, ...this.entries]
      this.upDate()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }
  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)
    this.entries = filteredEntries
    this.upDate()
    this.save()

  }
  filter() {
    const filterUser = document.querySelector('#filter')

    filterUser.addEventListener('input', function () {
      console.log(this.value);
      let userTable = document.querySelectorAll('.userTr')

      if (this.value.length > 0) {
        
        userTable.forEach(tr => {
          let userName = tr.querySelector('.userName').textContent
          let userGit = tr.querySelector('.userGit').textContent

          console.log(userGit);

          let expression = new RegExp(this.value, "i")

          if (!expression.test(userName) && !expression.test(userGit)) {
            tr.classList.add("invisible")
          } else {
            tr.classList.remove("invisible")
          }
        })
      }else {
        userTable.forEach(
          tr => {
            let userName = tr.querySelector('.userName').textContent
            let userGit = tr.querySelector('.userGit').textContent

            tr.classList.remove("invisible")
            console.log(userName);
          }
        )
      }
    })

  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.upDate()
    this.onAdd()
    this.onFocus()

  }
  onAdd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
      this.cleanInput()
      this.addContainer()
    }
  }
  upDate() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').innerHTML = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm(`tem certeza que dejesa deletar essa linha?`)
        if (isOk) {
          this.delete(user)
        }
      }
      this.tbody.append(row)
    })

  }
  createRow() {
    const tr = document.createElement('tr')
    tr.classList.add('userTr')
    tr.innerHTML = `
    <td class="user">
      <img src="" alt="imagem do usuario">
      <a href="" target="_blank">
        <p class="userName">Name</p>
        <span class= "userGit">User</span>
      </a>
    </td>
    <td class="repositories"></td>
    <td class="followers"></td>
    <td >
    <button class ="remove">Remover</button>
    </td>
    `
    return tr
  }
  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }

  onFocus() {
    this.root.querySelector('.search input').focus()

  }
  cleanInput() {
    this.root.querySelector('.search input').value = ''
  }
  addContainer() {
    let container = document.querySelector('.contet-empty')
    container.classList.add('sr-only')
  }
  removeContainer() {
    let container = document.querySelector('.contet-empty')
    container.classList.remove('sr-only')
  }
}
