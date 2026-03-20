Node:
Parent reference
[children] references

# Definition
    root({
        .properties = {.argument = value }
        }) {
        for loop through children {
            thisClass child = parent.items[i];
            child({ properties }) { children }
        }
    }

# Object / Class
    Position { x, y }
    Size { x, y }
    Children []
    Color 0-15

    drawContent() {
        draw self()
        foreach child in children {
            draw child()
        }
    }

# Position
    offset = padding
    foreach child
        child position = parent position + child position
        child position += offset
        offset += child size

# Order:

Fit Size Width pass
    Leaves > Root

Grow and Shrink Width pass
    Root > Leaves

Wrap Text pass

Fit Size Height pass
    Leaves > Root

Grow and Shrink Height pass
    Root > Leaves

Position pass
    Root > Leaves
    From top-left corner of parent

Draw pass
    Root > Leaves

## Example order
Open({              // Open root
    Open({})        // Open child 1
    Close()         // Close child 1
    Open({          // Open child 2
        Open({})    // Open child 2's child 1
        Close()     // Close child 2's child 1
        })
    Close()         // Close child 2
    })
Close()             // Close root

### Close function
    parent = child.parent
    padding = child.padding
    child.size += padding.a + padding.b
    gap = (parent.children.length - 1) * parent.gap
    if follow parent.direction
        child.size += gap
        parent.size += child.size
        parent.minsize += child.minsize
    else
        parent.size = max(child.size, parent.size)
        parent.size += max(child.minsize, parent.minsize)

### Grow and Shrink function
    remaining size = parent.size
    remaining size -= parent.padding.a + parent.padding.b
    foreach child in parent.children
        remaining size -= child.size
    remaining size -= (parent.children.length - 1) * gap

    while remaining size > 0
        smallest = growable[0]
        second smallest = infinity
        sizetoadd = remaining size
        foreach child in growable
            if child.size < smallest
                second smallest = smallest
                smallest = child.size
            if child.size > smallest
                second smallest = min(second smallest, child.size)
                size to add = second smallest - smallest
        size to add = min(size to add, remaining size / growable.length)
        foreach child in growable
            if child.size == smallest.size
                child.size += size to add
                remaining size -= size to add
        if follow parent.direction
            child.size += remaining size
        else
            child.size += (remaining size - child size)

    while remaining size < 0
        largest = shrinkable[0]
        second largest = 0
        sizetoadd = remaining size
        foreach child in shrinkable
            if child.size > largest
                second largest = largest
                largest = child.size
            if child.size < largest
                second largest = max(second largest, child.size)
                size to add = second largest - largest
        size to add = max(size to add, remaining size / shrinkable.length)
        foreach child in shrinkable
            previous size = child.size
            if child.size == largest.size
                child.size += sizetoadd
                if child.size <= child.minsize
                    child.size = child.minsize
                    shrinkable.remove(child)
                remaining size -= (child.size - previous size)
        if follow parent.direction
            child.size += remaining size
        else
            child.size += (remaining size - child size)

## Properties
### layout
        direction
            top to bottom, left to right, bottom to top, right to left

### sizing
        (default fit, fit)
        width
            fixed, grow (min, max), fit (min, max)
        height
            fixed, grow (min, max), fit (min, max)

### alignment
        left center right
        top center bottom

#### Text
    Preferred width (total line length)
minimum width (the longest word in the line length)

### background color
        color

### padding
        top, left, bottom, right

### gap
        value

