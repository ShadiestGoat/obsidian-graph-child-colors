# Graph Child Colors

An obsidian plugin that adds more intuative colors to the graph view.

## Features

- Set the color of tag nodes based on search
- Set the color of nodes based on parent nodes (irregardless of link direction)
- Works out of the box

## How it works

First, it colors in any tag node that is matched by the search queries
Then, it will color the children of already colored nodes, with the most common color

So if node U connects to nodes that are Blue, Yellow & Blue, then node U will be colored Blue.

If the top score is a tie, the behaviour is undefined.

## Contributing

I'm open to issues, PRs, etc!
