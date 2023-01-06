import numpy as np

m = 3 # one more than the number of dimensions
c_weights = 1+4*np.arange(m)
c_weights[-1] = 0

# c is a cardinal direction and has size m
def idx(c):
    return abs(c.flat@c_weights-1)>>1

ones = [1, -1]

# relations has shape (_, m, m) and its first element is an
#   order m identity matrix.
def create_mesh(n, layout, relations):
    k = 2*(m-1)
    V = np.tile(np.arange(n), (k, 1)).T
    R = np.tile(relations[0], (n, k, 1, 1))
    for i, target, j, r_id in layout:
        V[i, j] = target
        R[i, j] = relations[r_id]
        R[i, j, j>>1, -1] = ones[j&1]
        back_ij = target, idx(-R[i, j, :, -1])
        V[back_ij] = i
        R[back_ij] = np.linalg.inv(R[i, j])
    return V, R

n = 6 # number of vertices
layout = 0
r = np.reshape([0, -1, 0, 1, 0, 0, 0, 0, 1], (m, m))
s = np.reshape([-1, 0, 0, 0, 1, 0, 0, 0, 1], (m, m))
I = s@s
D4 = np.array([I, s, s@r@r, r@r, s@r, r, r.T, s@r.T])
V, R = create_mesh(n, layout, D4)

# --------------------------------------------

# directs = np.full((k, m, 1), 0)
# directs.flat[0::k+3] = 1
# directs.flat[m::k+3] = -1

class Walk:
    vertex = 0
    orient = I

    def to(s, direct):
        ij = s.vertex, idx(s.orient@direct)
        s.vertex = V[ij]
        s.orient = s.orient@R[ij]
        return s.vertex, s.orient
