class BTreeNode {
    constructor(order, leaf = true) {
        this.order = order;
        this.leaf = leaf;
        this.keys = [];
        this.children = [];
    }

    toJSON() {
        return {
            leaf: this.leaf,
            keys: this.keys,
            children: this.children.map(child => child.toJSON())
        };
    }

    search(key) {
        let i = 0;
        while (i < this.keys.length && key > this.keys[i]) {
            i++;
        }

        if (i < this.keys.length && key === this.keys[i]) {
            return { node: this, index: i };
        }

        if (this.leaf) {
            return null;
        }

        return this.children[i].search(key);
    }

    insertNonFull(key) {
        let i = this.keys.length - 1;

        if (this.leaf) {
            while (i >= 0 && key < this.keys[i]) {
                i--;
            }
            this.keys.splice(i + 1, 0, key);
        } else {
            while (i >= 0 && key < this.keys[i]) {
                i--;
            }
            i++;

            if (this.children[i].keys.length === 2 * this.order - 1) {
                this.splitChild(i, this.children[i]);
                if (key > this.keys[i]) {
                    i++;
                }
            }
            this.children[i].insertNonFull(key);
        }
    }

    splitChild(i, y) {
        const z = new BTreeNode(y.order, y.leaf);
        const t = y.order;

        const midKey = y.keys[t - 1];

        z.keys = y.keys.slice(t);
        y.keys = y.keys.slice(0, t - 1);

        if (!y.leaf) {
            z.children = y.children.slice(t);
            y.children = y.children.slice(0, t);
        }

        this.children.splice(i + 1, 0, z);
        this.keys.splice(i, 0, midKey);
    }
}

class BTree {
    constructor(order = 3) {
        if (order < 2) {
            throw new Error('B-Tree order must be at least 2');
        }
        this.order = order;
        this.root = new BTreeNode(order, true);
    }

    insert(key) {
        if (this.search(key)) {
            return false;
        }

        const r = this.root;
        if (r.keys.length === 2 * this.order - 1) {
            const s = new BTreeNode(this.order, false);
            s.children.push(r);
            s.splitChild(0, r);
            const i = (s.keys[0] < key) ? 1 : 0;
            s.children[i].insertNonFull(key);
            this.root = s;
        } else {
            r.insertNonFull(key);
        }
        return true;
    }

    search(key) {
        return this.root ? this.root.search(key) : null;
    }

    toJSON() {
        return this.root ? this.root.toJSON() : null;
    }

    cloneFromJSON(json) {
        if (!json) {
            this.root = new BTreeNode(this.order, true);
            return;
        }

        const build = (nodeJson) => {
            const node = new BTreeNode(this.order, nodeJson.leaf);
            node.keys = [...nodeJson.keys];
            node.children = nodeJson.children.map(c => build(c));
            return node;
        };

        this.root = build(json);
    }

    countNodes() {
        let count = 0;
        const walk = (node) => {
            count += 1;
            if (!node.leaf) {
                node.children.forEach(child => walk(child));
            }
        };
        walk(this.root);
        return count;
    }

    countKeys() {
        let count = 0;
        const walk = (node) => {
            count += node.keys.length;
            if (!node.leaf) {
                node.children.forEach(child => walk(child));
            }
        };
        walk(this.root);
        return count;
    }

    getTreeStructure() {
        const levels = [];

        const traverse = (node, depth = 0) => {
            if (!levels[depth]) {
                levels[depth] = [];
            }
            levels[depth].push({
                keys: [...node.keys],
                leaf: node.leaf,
                childCount: node.children.length
            });
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => traverse(child, depth + 1));
            }
        };

        if (this.root) {
            traverse(this.root);
        }

        return {
            levels,
            totalNodes: this.countNodes(),
            totalKeys: this.countKeys(),
            root: this.toJSON()
        };
    }

    delete(key) {
        if (!this.search(key)) {
            return false;
        }
        this.root = this.deleteRecursive(this.root, key);
        if (this.root && this.root.keys.length === 0 && !this.root.leaf && this.root.children.length > 0) {
            this.root = this.root.children[0];
        }
        return true;
    }

    deleteRecursive(node, key) {
        let i = 0;
        while (i < node.keys.length && key > node.keys[i]) {
            i++;
        }

        if (i < node.keys.length && key === node.keys[i]) {
            if (node.leaf) {
                node.keys.splice(i, 1);
            } else {
                this.deleteFromNonLeaf(node, i);
            }
        } else if (!node.leaf) {
            const isInSubtree = (i === node.keys.length);
            if (node.children[i].keys.length < this.order) {
                this.fillChild(node, i);
            }
            if (isInSubtree && i > node.keys.length) {
                this.deleteRecursive(node.children[i - 1], key);
            } else {
                this.deleteRecursive(node.children[i], key);
            }
        }
        return node;
    }

    deleteFromNonLeaf(node, i) {
        const key = node.keys[i];
        if (node.children[i].keys.length >= this.order) {
            const predecessor = this.getPredecessor(node, i);
            node.keys[i] = predecessor;
            this.deleteRecursive(node.children[i], predecessor);
        } else if (node.children[i + 1].keys.length >= this.order) {
            const successor = this.getSuccessor(node, i);
            node.keys[i] = successor;
            this.deleteRecursive(node.children[i + 1], successor);
        } else {
            this.merge(node, i);
            this.deleteRecursive(node.children[i], key);
        }
    }

    getPredecessor(node, i) {
        let curr = node.children[i];
        while (!curr.leaf) {
            curr = curr.children[curr.children.length - 1];
        }
        return curr.keys[curr.keys.length - 1];
    }

    getSuccessor(node, i) {
        let curr = node.children[i + 1];
        while (!curr.leaf) {
            curr = curr.children[0];
        }
        return curr.keys[0];
    }

    fillChild(node, i) {
        if (i !== 0 && node.children[i - 1].keys.length >= this.order) {
            this.borrowFromPrev(node, i);
        } else if (i !== node.children.length - 1 && node.children[i + 1].keys.length >= this.order) {
            this.borrowFromNext(node, i);
        } else {
            if (i !== node.children.length - 1) {
                this.merge(node, i);
            } else {
                this.merge(node, i - 1);
            }
        }
    }

    borrowFromPrev(node, child_idx) {
        const child = node.children[child_idx];
        const sibling = node.children[child_idx - 1];
        child.keys.unshift(node.keys[child_idx - 1]);
        node.keys[child_idx - 1] = sibling.keys.pop();
        if (!child.leaf) {
            child.children.unshift(sibling.children.pop());
        }
    }

    borrowFromNext(node, child_idx) {
        const child = node.children[child_idx];
        const sibling = node.children[child_idx + 1];
        child.keys.push(node.keys[child_idx]);
        node.keys[child_idx] = sibling.keys.shift();
        if (!child.leaf) {
            child.children.push(sibling.children.shift());
        }
    }

    merge(node, i) {
        const child = node.children[i];
        const sibling = node.children[i + 1];
        child.keys.push(node.keys[i]);
        child.keys.push(...sibling.keys);
        if (!child.leaf) {
            child.children.push(...sibling.children);
        }
        node.keys.splice(i, 1);
        node.children.splice(i + 1, 1);
    }
}

module.exports = BTree;
