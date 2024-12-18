class UnionFind {
  constructor(size) {
    this.parent = Array(size).fill(0).map((_, index) => index);
    this.rank = Array(size).fill(1);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);  // 路径压缩
    }
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX !== rootY) {
      if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX;
      } else if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY;
      } else {
        this.parent[rootY] = rootX;
        this.rank[rootX] += 1;
      }
    }
  }
}
function deepCopyObj(obj) {
	// * 深拷贝(redux中的不可变)对象
	const newObj = {};
	for (let p in obj) {
		if (typeof p !== 'object') {
			newObj[p] = obj[p];
		} else {
			newObj[p] = deepCopyObj(obj[p]); // * 是对象就建
		}
	}
	return newObj;
}
export default function commentListTransPlus(commentListIn) {
  // 通过排序解决顺序不确定的问题
  commentListIn.sort((a, b) => a.id - b.id);
  
  // 深拷贝评论列表
  const commentList = commentListIn.map(item => deepCopyObj(item));
  
  const uf = new UnionFind(commentList.length);

  // 建立并查集的连接关系
  commentList.forEach((comment, index) => {
    if (comment.comment_comment_id !== null) {
      // 获取父评论的索引
      const parentIndex = commentList.findIndex(c => c.id === comment.comment_comment_id);
      if (parentIndex !== -1) {
        // 将当前评论与父评论合并
        uf.union(index, parentIndex);
      }
    }
  });

  // 根据并查集找到每个评论的根节点
  const rootMap = new Map();
  commentList.forEach((comment, index) => {
    const root = uf.find(index);
    if (!rootMap.has(root)) {
      rootMap.set(root, []);
    }
    // 将评论添加到它的根节点的列表中
    rootMap.get(root).push(comment);
  });

  // 组织每条根评论的子评论数组
  const result = [];
  rootMap.forEach((comments, root) => {
    const parentComment = comments[0];  // 根评论
    parentComment.childComments = comments.slice(1);  // 将子评论添加到父评论的 childComments 中
    result.push(parentComment);
  });

  return result;
}