
function gid(x) {return document.getElementById(x)}
function ce(x) {return document.createElement(x)}
const params = new URLSearchParams(window.location.search);
var gameParam = params.get('g');
var authorParam = params.get('a');
var tagParam = params.get('t');
var pageParam = params.get('p');
if (gameParam) {if (gameParam.length>0) createGamePage(gameParam)
} else if (authorParam) {if (authorParam.length>0) createAuthorPage(authorParam)
} else if (tagParam) {if (tagParam.length>0) createTagPage(tagParam)
} else if (pageParam) {if (pageParam.length>0) createPage(pageParam)
} else {createIndex()}

async function fileExists(url) {
  try {
    const response = await fetch(url,{method:'HEAD'});
    return response.ok;
  } catch (err) {
    console.error('An error occurred:', err);
    return false;
  }
}

function randomPage() {
  let allKeys = Object.keys(games).map(str=>"g"+str).concat(Object.keys(authors).map(str=>"a"+str),Object.keys(tags).map(str=>"t"+str));
  let selected = allKeys[Math.floor(Math.random()*allKeys.length)]
  let type = selected.charAt(0)
  return `/?${type}=${selected.slice(1)}`
}

gid("random_page").addEventListener("click",()=>{
  window.location.href = randomPage();
})

async function createIndex() {
  let content = ce("div")
  content.classList.add("content")
  content.innerHTML += `<h1>Welcome to the IGM Game Database!</h1>
<p>This will hopefully one day be the largest list of IGM games on the web. Feel free to explore the current collection at your leisure.</p>
<p>Release dates may be one day off due to time zone differences.</p>
<p>This website currently has ${Object.keys(games).length} games and ${Object.keys(authors).length} authors.</p>
<h2>Featured Games</h2>`
  content.appendChild(gameBox("fake-money-clicker"));
  content.appendChild(gameBox("cargohold-idle"));
  gid("main").appendChild(content);
}
async function createGamePage(id) {
  if (games[id]) {
    let banner = ce("div");
    banner.classList.add("banner");
    banner.style.backgroundImage = `url("./images/banners/${id}.png")`;
    let content = ce("div")
    content.classList.add("content")
    let title = ce("h1");
    title.innerText = games[id].name;
    content.appendChild(title);
    let author = ce("p");
    author.innerHTML = `Author: <a href="./?a=${games[id].author}">${authors[games[id].author].name}</a>`
    content.appendChild(author);
    let release = ce("p");
    release.innerHTML = `Released ${games[id].release}`
    content.appendChild(release);
    let tags = ce("p");
    tags.innerText += "Tags: "
    games[id].tags.forEach(tag => {
      tags.innerHTML += `<a class="tag" href="?t=${tag}">${tag}</a> `
    });
    content.appendChild(tags)
    if (fileExists(`./games/${id}.txt`)) {
      await fetch(`./games/${id}.txt`)
        .then(data => {return data.text()})
        .then(data => {content.innerHTML += data;});
    } else {
      content.innerHTML += "Could not find any information on this game.";
    }
    if (games[id].related) {
      content.innerHTML += "<h2>Related Games</h2>";
      games[id].related.forEach(game => {
        content.appendChild(gameBox(game));
      })
    }
    gid("main").appendChild(banner);
    gid("main").appendChild(content);
  } else {
    let content = ce("div")
    content.classList.add("content")
    content.innerText = "Unfortunately, no game exists at this link."
    gid("main").appendChild(content);
  }
}

async function createAuthorPage(id) {
  if (authors[id]) {
    let banner = ce("div");
    banner.classList.add("banner");
    banner.style.backgroundImage = `url("./images/banners/${id}.png")`;
    let content = ce("div")
    content.classList.add("content")
    let title = ce("h1");
    title.innerText = authors[id].name;
    content.appendChild(title);
    if (authors[id].aka && authors[id].aka.length > 0) {
      let aka = ce("p");
      aka.innerText += "a.k.a. "
      let comma = false;
      authors[id].aka.forEach(name => {
        if(comma) {aka.innerHTML += ", "} else {comma = true;}
        aka.innerText += name
      });
      content.appendChild(aka)
    }
    console.log(fileExists(`./authors/${id}.txt`))
    if (fileExists(`./authors/${id}.txt`)) {
      console.log(`./authors/${id}.txt exists`)
      await fetch(`./authors/${id}.txt`)
        .then(data => {return data.text()})
        .then(data => {content.innerHTML += data;});
    }
    content.innerHTML += `<h2>Games by ${authors[id].name}</h2>`
    for (game in games) {
      if (games[game].author == id) {
        content.appendChild(gameBox(game))
      }
    }
    gid("main").appendChild(banner);
    gid("main").appendChild(content);
  } else {
    let content = ce("div")
    content.classList.add("content")
    content.innerText = "Unfortunately, no author exists at this link."
    gid("main").appendChild(content);
  }
}

function createTagPage(id) {
  let content = ce("div")
  content.classList.add("content")
  let title = ce("h1");
  title.innerText = `Games tagged "${id}"`;
  content.appendChild(title);
  if (tags[id]) {
    let desc = ce("p");
    desc.innerHTML += tags[id].desc
    content.appendChild(desc);
  }
  for (game in games) {
    if (games[game].tags.includes(id)) {
      content.appendChild(gameBox(game))
    }
  }
  gid("main").appendChild(content);
}

function createPage(id) {
  if (id == "games") {
    let content = ce("div")
    content.classList.add("content")
    let title = ce("h1");
    title.innerText = "All Games";
    content.appendChild(title);
    let desc = ce("p");
    desc.innerHTML += "Every game on the website, sorted alphabetically."
    content.appendChild(desc);
    Object.keys(games).sort((a,b) => {
      return games[a].name.toLowerCase() > games[b].name.toLowerCase()
    }).forEach(game => {
      content.appendChild(gameBox(game))
    });
    gid("main").appendChild(content);
  } else if (id == "authors") {
    let content = ce("div")
    content.classList.add("content")
    let title = ce("h1");
    title.innerText = "All Authors";
    content.appendChild(title);
    let desc = ce("p");
    desc.innerHTML += "Every author on the website, sorted alphabetically."
    content.appendChild(desc);
    Object.keys(authors).sort((a,b) => {
      return authors[a].name.toLowerCase() > authors[b].name.toLowerCase()
    }).forEach(author => {
      content.appendChild(authorBox(author))
    });
    gid("main").appendChild(content);
  } else if (fileExists(`./pages/${id}.txt`)) {
    let content = ce("div")
    content.classList.add("content")
    fetch(`./pages/${id}.txt`)
      .then(data => {return data.text()})
      .then(data => {content.innerHTML += data;});
    gid("main").appendChild(content);
  }
}

function gameBox(id) {
  let box = ce("a");
  box.href = "./?g="+id;
  box.classList.add("game_box");
  let image = ce("div");
  image.style.backgroundImage = `url("./images/banners/${id}.png")`;
  image.classList.add("image");
  box.appendChild(image);
  let title = ce("p");
  title.classList.add("title");
  title.innerText = games[id].name;
  box.appendChild(title);
  let author = ce("p");
  author.classList.add("author");
  author.innerText = authors[games[id].author].name;
  box.appendChild(author);
  return box;
}

function authorBox(id) {
  let box = ce("a");
  box.href = "./?a="+id;
  box.classList.add("game_box");
  let image = ce("div");
  image.style.backgroundImage = `url("./images/banners/${id}.png")`;
  image.classList.add("image");
  box.appendChild(image);
  let title = ce("p");
  title.classList.add("title");
  title.innerText = authors[id].name;
  box.appendChild(title);
  return box;
}

// Theme and preference selection

let theme = 0;
if (localStorage.getItem("theme") !== null) {
  let savedTheme = localStorage.getItem("theme");
  if (typeof savedTheme !== "undefined") {theme = parseInt(savedTheme)};
}

var themeSelect = gid("theme_select");
themeSelect.onchange = themeChange;

setTheme(theme);

function saveTheme() {
  localStorage.setItem("theme", theme.toString());
}

function cssChange(variable, value) {document.documentElement.style.setProperty(("--").concat(variable), value);}

function themeChange() {
  theme = themeSelect.selectedIndex;
  saveTheme();
  setTheme(theme);
};

function setTheme(theme) {
  themeSelect.selectedIndex = theme
  let themes = [
    {"accent-color": "#d390ab","bg-color": "#0b2f51","bg-color2": "#1f1931","text-color": "#ffffff"},
    {"accent-color": "#40ccf0","bg-color": "#0b2f51","bg-color2": "#192131","text-color": "#ffffff"},
    {"accent-color": "#f0ed40","bg-color": "#510b0b","bg-color2": "#31191e","text-color": "#ffffff"},
    {"accent-color": "#40ccf0","bg-color": "#0b5117","bg-color2": "#1a3119","text-color": "#ffffff"},
    {"accent-color": "#f040b5","bg-color": "#510b45","bg-color2": "#311921","text-color": "#ffffff"},
    {"accent-color": "#cccccc","bg-color": "#111111","bg-color2": "#000000","text-color": "#ffffff"},
    {"accent-color": "#f0ed40","bg-color": "#513e0b","bg-color2": "#312b19","text-color": "#ffffff"},
  ]
  for (key in themes[theme]) {cssChange(key,themes[theme][key])}
};