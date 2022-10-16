import numpy as np

square_edges = np.empty([4, 8, 3, 3], dtype=int)

d0 = np.array([[1, 0], [0, 1]])
d3 = np.array([[-1, 0], [0, -1]])
d5 = np.array([[0, -1], [1, 0]])
d6 = np.array([[0, 1], [-1, 0]])

ce = np.array([[1], [0]])
cw = np.array([[-1], [0]])
cs = np.array([[0], [1]])
cn = np.array([[0], [-1]])

def rInv(r):
    mInv = np.linalg.inv(r[0])
    return np.array([mInv, mInv@(-1*r[1])])

E = [[0, 1, d0, ce],
    [0, 2, d3, cn],
    [0, 3, d3, cs],
    [0, 4, d0, cw],
    [1, 2, d6, cn],
    [1, 3, d5, cs],
    [1, 5, d0, ce],
    [2, 4, d6, ce],
    [2, 5, d0, cs],
    [3, 4, d5, ce],
    [3, 5, d0, cn],
    [4, 5, d0, cw]]

G = np.full([6, 6, 2], None)

for e in E:
    G[e[0], e[1]] = 2 # [e[2], e[3]]
    G[e[1], e[0]] = [4,4] #rInv([e[2], e[3]])

print(G)

# def mat(i):
#     m = np.array([[(i&1)*-2+1, 0], [0, ((i>>1)&1)*-2+1]])
#     if (i>>2)&1 == 1:
#         m = np.fliplr(m)
#     return m

# def idx(m):
#     s = np.sum(m, 1)
#     i = 4 if m[0, 0] == 0 else 0
#     if s[0] == -1:
#         i += 1
#     if s[1] == -1:
#         i += 2
#     return i
