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
}

module.exports = BTree;
