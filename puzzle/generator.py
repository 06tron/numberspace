import numpy as np

r = np.reshape([0, -1, 0, 1, 0, 0, 0, 0, 1], (3, 3))
s = np.reshape([-1, 0, 0, 0, 1, 0, 0, 0, 1], (3, 3))
D4 = np.array([s@s, s, s@r@r, r@r, s@r, r, r.T, s@r.T])

nth = np.reshape([0, -1, 0], (3, 1))
wst = np.reshape([-1, 0, 0], (3, 1))
est = -wst
sth = -nth

c_weights = np.array([1, 3, 0])
idx = lambda c : (c_weights@c)[0]+3

print(idx(D4[3]@est))
